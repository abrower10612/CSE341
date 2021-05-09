//TA03 PLACEHOLDER
const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const p = path.join(path.dirname(require.main.filename), 'data', 'data.json');

router.get('/',(req, res, next) => {
        getData('', (data) => {
            res.render('pages/ta03', { 
                title: 'Team Activity 03', 
                path: '/ta03', 
                data: data
            });
        });
    });

const getData = (searchText, cb) => {
    fs.readFile(p, (err, fileContent) => {
        let data = [];
        
        if (!err) {
            data = JSON.parse(fileContent);
        }
        if (searchText !== '') {
            data = data.filter((x) => x.tags.includes(searchText));
        };
        cb(data);
    });
};

router.post('/filter', (req, res, next) => {
    let tag = req.body.tag;

    getData(tag, (data) => {
        res.render('pages/ta03', { 
            title: 'Team Activity 03', 
            path: '/ta03', 
            data: data
        });
    });
});

module.exports = router;