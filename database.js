const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('dotenv').config();

const AdvertisementSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		author: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		tags: {
			type: [String],
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

AdvertisementSchema.pre('save', function () {
	console.log('task is going to be saved at: ' + new Date().toISOString());
});

AdvertisementSchema.post('save', function () {
	console.log('task saved at: ' + new Date().toISOString());
});

const collectionName = 'Advertisements';
const AdvertisementModel = mongoose.model(collectionName, AdvertisementSchema);

async function run() {
	await mongoose.connect(process.env.CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		dbName: process.env.DB_NAME,
	});

	const newAdvertisement = new AdvertisementModel({
		id: '1',
		title: 'Thing',
		description: 'Special thing',
		author: 'Jan Nowak',
		category: 'Books',
		tags: 'fantasy',
		price: 5,
	});

	await newAdvertisement.validate();

	let result = await newAdvertisement.save();
	console.log(`task saved with id ${result._id}`);

	newAdvertisement.isCompleted = true;
	result = await newAdvertisement.save();
	console.log(`task updated at: ${result.updatedAt}`);

	const ads = await AdvertisementModel.find();
	for await (const ad of ads) {
		console.log(ad);

		ad.name = ad.name + ' updated';
		await ad.save();
	}
	await AdvertisementModel.updateMany({ isCompleted: true }, { isCompleted: false });

	await AdvertisementModel.updateMany({}, { this_field_does_not_exists: false });

	await AdvertisementModel.deleteMany({ completed: 'true' });

	await mongoose.connection.close();
}
run().catch(err => console.log(err));
