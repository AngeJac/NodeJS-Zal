require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 4700;
app.use(express.json());

// Połączenie z bazą danych MongoDB
mongoose.connect(process.env.CONNECTION_STRING, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
	console.log('Connected to MongoDB');
});

// Schemat ogłoszenia
const advertisementSchema = new mongoose.Schema({
	title: String,
	description: String,
	author: String,
	category: String,
	tags: [String],
	price: Number,
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

// Na żądania wysłane pod adres /heartbeat aplikacja odpowiada zwracając aktualną datę i godzinę.

app.get('/heartbeat', (req, res) => {
	const currentDate = new Date().toString();
	res.send(`Current date and time:${currentDate}`);
});

// Aplikacja umożliwia dodawanie ogłoszenia.

app.post('/advertisements', (req, res) => {
	const { title, description, author, category, tags, price } = req.body;

	if (!title || !description || !author || !category || !tags || !price) {
		res.status(400).json({ error: 'No required fields' });
	}

	const newAdvertisement = new Advertisement({
		title,
		description,
		author,
		category,
		tags,
		price,
	});

	newAdvertisement.save((err, savedAdvertisement) => {
		if (err) {
			console.error('Error saving advertisement:', err);
			res.status(500).json({ error: 'Failed to save advertisement' });
		} else {
			res.status(201).json(savedAdvertisement);
		}
	});
});

// Aplikacja umożliwia zwracanie pojedynczego ogłoszenia.

app.get('/advertisements/:id', (req, res) => {
	const { id } = req.params;

	Advertisement.findById(id, (err, advertisement) => {
		if (err) {
			console.error('Error retrieving advertisement:', err);
			res.status(500).json({ error: 'Failed to retrieve advertisement' });
		} else if (advertisement) {
			res.format({
				html: function () {
					res.send(`<div>
            <p>ID: ${advertisement.id}</p>
            <p>Title: ${advertisement.title}</p>
            <p>Description: ${advertisement.description}</p>
            <p>Author: ${advertisement.author}</p>
            <p>Category: ${advertisement.category}</p>
            <p>Tags: ${advertisement.tags}</p>
            <p>Price: ${advertisement.price}</p>
          </div>`);
				},
				text: function () {
					res.send(
						`ID: ${advertisement.id}, Title: ${advertisement.title}, Description: ${advertisement.description}, Author: ${advertisement.author}, Category: ${advertisement.category}, Tags: ${advertisement.tags}, Price: ${advertisement.price}`
					);
				},
				json: function () {
					res.send(advertisement);
				},
			});
		} else {
			res.status(404).json({ error: 'Advertisement not found' });
		}
	});
});

// Aplikacja umożliwia zwracanie wszystkich ogłoszeń.
app.get('/advertisements', (req, res) => {
	Advertisement.find((err, advertisements) => {
		if (err) {
			console.error('Error retrieving advertisements:', err);
			res.status(500).json({ error: 'Failed to retrieve advertisements' });
		} else {
			res.json(advertisements);
		}
	});
});

// Aplikacja umożliwia usuwanie wybranego ogłoszenia.
app.delete('/advertisements/:id', (req, res) => {
	const { id } = req.params;

	Advertisement.findByIdAndDelete(id, (err, deletedAdvertisement) => {
		if (err) {
			console.error('Error deleting advertisement:', err);
			res.status(500).json({ error: 'Failed to delete advertisement' });
		} else if (deletedAdvertisement) {
			res.status(204).send();
		} else {
			res.status(404).json({ error: 'Advertisement not found' });
		}
	});
});

// Aplikacja umożliwia modyfikowanie wybranego ogłoszenia.
app.put('/advertisements/:id', (req, res) => {
	const { id } = req.params;
	const updatedFields = req.body;

	Advertisement.findByIdAndUpdate(id, updatedFields, { new: true }, (err, updatedAdvertisement) => {
		if (err) {
			console.error('Error updating advertisement:', err);
			res.status(500).json({ error: 'Failed to update advertisement' });
		} else if (updatedAdvertisement) {
			res.status(200).json(updatedAdvertisement);
		} else {
			res.status(404).json({ error: 'Advertisement not found' });
		}
	});
});

// Aplikacja pozwala na wyszukiwanie ogłoszeń według różnych kryteriów
app.get('/advertisements/search', (req, res) => {
	const { title, description, author, category, tags } = req.query;

	const query = {};

	if (title) {
		query.title = title;
	}
	if (description) {
		query.description = description;
	}
	if (author) {
		query.author = author;
	}
	if (category) {
		query.category = category;
	}
	if (tags) {
		query.tags = { $all: tags };
	}

	Advertisement.find(query, (err, filteredAdvertisements) => {
		if (err) {
			console.error('Error filtering advertisements:', err);
			res.status(500).json({ error: 'Failed to filter advertisements' });
		} else {
			res.status(200).json(filteredAdvertisements);
		}
	});
});

app.listen(port, () => {
	console.log('Server started');
});
