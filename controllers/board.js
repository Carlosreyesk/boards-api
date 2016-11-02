const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const User = require('../models/User');

// exports.getBoard = (req, res) => {
//   if (req.user) {
//     Board.find
//     return res.send({ success: true, user: req.user });
//   }
//     return res.send({ success: false });
// };

exports.postBoard = (req, res) => {
    if (req.user) {
        let board = new Board;
        board._owner = req.user._id;
        board.title = req.body.board.title;
        board.save();
        return res.send({ success: true, board: board });
    }
        return res.send({ success: false, flash: "Not Authenticated" });
}

exports.getBoard = (req, res) => {
    if(req.user){
        Board.findOne({ _id: req.params.id })
        .populate({
            path: 'columns',
            populate: { path: 'cards' }
        })
        .exec(function(err, board){
            if (err) { return next(err); }
            return res.send({ success: true, board: board })
        });
    }else{
        return res.send({ success: false, flash: 'Not Authenticated' });
    }
}

exports.getBoards = (req, res) => {
    if(req.user){
        Board.find({ _owner: req.user._id }, function(err, result){
            // console.log(result);
            // console.log(boards);
            if (err) { console.log(err); return next(err); };
            return res.send({ success: true, boards: result }); 
        });
    }else{
        return res.send({ success: false, flash: 'Not Authenticated' });
    }
}

exports.postList = (req, res) => {
    if (req.user) {
        let list = new List;
        list._board = req.body.list.boardId;
        list.title = req.body.list.title;
        list.save();
        Board.findOne({ _id: req.body.list.boardId })
        .exec(function(err, board){
            if (err) { console.log(err); return next(err); };
            board.columns.push(list._id);
            board.save();
            return res.send({ success: true, list: list }); 
        });
    }else{
         return res.send({ success: false, flash: "Not Authenticated" });
    }
}

exports.postCard = (req, res) => {
    if (req.user) {
        let card = new Card;
        card.title = req.body.card.title;
        card._list = req.body.card._list;
        card.save();
        List.findOne({ _id: req.body.card._list })
        .exec(function(err, list){
            if (err) { console.log(err); return next(err); };
            list.cards.push(card._id);
            list.save();
            return res.send({ success: true, card: card }); 
        });
    }else{
         return res.send({ success: false, flash: "Not Authenticated" });
    }
}