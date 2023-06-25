require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4700;
app.use(express.json());

const advertisements = [];
app.use(express.urlencoded({ extended: true }));
let nextId = 1;

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

	const newAdvertisement = {
		id: nextId,
		title,
		description,
		author,
		category,
		tags,
		price,
	};

	advertisements.push(newAdvertisement);
	nextId++;

	res.status(201).json(newAdvertisement);
});

// Aplikacja umożliwia zwracanie pojedynczego ogłoszenia.

app.get('/advertisements/:id', (req, res) => {
	const { id } = req.params;
	const advertisement = advertisements.find(ad => ad.id === parseInt(id));

	if (advertisement) {
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

// Aplikacja umożliwia zwracanie wszystkich ogłoszeń.
app.get('/advertisements', (req, res) => {
	res.json(advertisements);
});

// Aplikacja umożliwia usuwanie wybranego ogłoszenia.
app.delete('/advertisements/:id', (req, res) => {
	const { id } = req.params;
	const advertisementIndex = advertisements.findIndex(ad => ad.id === parseInt(id));

	if (advertisementIndex === -1) {
		res.status(404).send('Advertisement not found');
	} else {
		advertisements.splice(advertisementIndex, 1);
		res.status(204).send();
	}
});

// Aplikacja umożliwia modyfikowanie wybranego ogłoszenia.
app.put('/advertisements/:id', (req, res) => {
	const { id } = req.params;
	const updatedFields = req.body;

	const advertisement = advertisements.find(ad => ad.id === parseInt(id));

	if (!advertisement) {
		res.status(404).json({ error: 'Advertisement not found' });
	} else {
		Object.keys(updatedFields).forEach(key => {
			if (key in advertisement) {
				advertisement[key] = updatedFields[key];
			}
		});

		res.status(200).json(advertisement);
	}
});

// Aplikacja pozwala na wyszukiwanie ogłoszeń według różnych kryteriów
app.get('/advertisements/search', (req, res) => {
	const { title, description, author, category, tags } = req.query;

	const filteredAdvertisements = advertisements.filter(ad => {
		return (
			(!title || ad.title.toLowerCase().includes(title.toLowerCase())) &&
			(!description || ad.description.toLowerCase().includes(description.toLowerCase())) &&
			(!author || ad.author.toLowerCase().includes(author.toLowerCase())) &&
			(!category || ad.category.toLowerCase().includes(category.toLowerCase())) &&
			(!tags || tags.some(tags => ad.tags.includes(tags.toLowerCase())))
		);
	});

	if (filteredAdvertisements.length > 0) {
		res.status(200).json(filteredAdvertisements);
	} else {
		res.status(404).json({ message: 'No matching advertisement found' });
	}
});

app.listen(port, console.log('server started'));
