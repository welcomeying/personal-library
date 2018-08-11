/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('library').find({}).toArray((err, data) => {
          if (err) return;
          res.json(data);
        });
        db.close();
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) return res.send("missing title");
      let newBook = {
        book_title: title,
        book_comments: [],
        commentcount: 0
      };
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('library').insert(newBook,(err, data) => {
          if (err) return;
          res.json(newBook);
        });
        db.close();
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('library').remove({}, (err, data) => {
          if (err) return
          else {
            res.send("complete delete successful");
          }
        });
        db.close();
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      if (!bookid || bookid.length !== 24) return res.send('no book exists');
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('library').find({_id: ObjectId(bookid)}).toArray((err, data) => {
          if (err) return;
          if (data.length == 0) res.send("no book exists");
          else res.json(data[0]);
        });
        db.close();
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('library').
        findAndModify({_id: ObjectId(bookid)}, {}, 
                      {$push: {book_comments: comment}, $inc: {commentcount: 1}}, 
                      {new: true}, (err, response) => {
                        if (err) console.log(err);
                        return res.json(response.value);
                      });
        db.close();
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        db.collection('library').remove({_id: ObjectId(bookid)}, (err, data) => {
          if (err) console.log(err);
          if (!data) res.send("no book exists");
          else {
            res.send("delete successful");
          }
        });
        db.close();
      });
    });
  
};
