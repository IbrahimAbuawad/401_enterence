'use strict';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const superagent = require('superagent');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3080;
const DB = process.env.DATABASE_URL;

mongoose.connect(
    'mongodb://localhost:27017/pyschonauts'
    , {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    });

const Schema = mongoose.Schema;

const Characters = new Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true
    },
    slug: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true
    },
    gender: String,
    img: String,
    psiPowers: Object
});

const pyschonautsModel = mongoose.model('pyschonautsModel', Characters);


app.use(cors());
app.use(express.json());

class Psychonauts {
    constructor(apiData) {
        this.name = apiData.name;
        this.gender = apiData.gender;
        this.img = apiData.img;
        this.psiPowers = apiData.psiPowers;
    }
}

// API proof of life
app.get('/', (req, res) => {
    res.send('everything is working!')
});

app.get('/pyschonauts', (req, res) => {

    const APIUrl = `https://psychonauts-api.herokuapp.com/api/characters?limit=10`
    superagent.get(APIUrl).then(data => {
        const newData = data.body.map(myData => new Psychonauts(myData));
        res.send(newData);
    }).catch(console.error())
});

//..................................................CRUD

app.get('/pyschonauts/fav', (req, res) => {
    pyschonautsModel.find({}, (err, data) => {
        res.send(data)
    })
});

app.post('/pyschonauts/fav', (req, res) => {
    const { name, gender, img, psiPowers } = req.body;
    const slug = name.toLowerCase().split(' ').join('_');

    pyschonautsModel.find({slug:slug}, (err, data) => {
        if (data.length > 0) {
            res.send('data already exist');
        }
        else {
            const newpyschonautsModel = new pyschonautsModel({
                name: name, gender: gender, img: img, psiPowers: psiPowers, slug: slug
            })
            newpyschonautsModel.save();
            res.send(newpyschonautsModel);
        }
    })
});

app.delete('/pyschonauts/fav/:slug', (req, res) => {
    const slug = req.params.slug;
    pyschonautsModel.remove({slug:slug},(err,data)=>{
        pyschonautsModel.find({},(err,data2)=>{
            res.send(data2);
        })
    })
});

app.put('/pyschonauts/fav/:slug', (req, res) => {
    const slug = req.params.slug;
    const { name, gender } = req.body;
    pyschonautsModel.find({slug:slug},(err,data)=>{
        data[0].name =name;
        data[0].gender =gender;
        data[0].save();

        res.send(data);

    })
});

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});