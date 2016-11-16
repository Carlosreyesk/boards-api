const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Label = require('../models/Label');

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
        board.members.push(req.user._id);
        board.title = req.body.board.title;
        board.save();
        User.findOne({ _id: req.user._id })
            .exec(function (err, user) {
                user.boards.push(board._id);
                user.save();
                return res.send({ success: true, board: board });
            })
    } else {
        return res.send({ success: false, flash: "Not Authenticated" });
    }
}

exports.putBoard = (req, res) => {
    if (req.user) {
        Board.findOne({ _id: req.body.board._id }).exec(function (err, board) {
            console.log(req.body.board.columns);
            console.log(board.columns);
            board.columns = [];
            let remainingColCount = req.body.board.columns.length;
            console.log('remaining: '+remainingColCount);
            console.log(board.columns);
            req.body.board.columns.forEach(function (col, colIndex) {
                List.findOne({ _id: col._id }).exec(function (err, list) {
                    if (err) { return next(err); }
                    board.columns[colIndex] = list._id;
                    remainingColCount--;
                    console.log('remaining: '+remainingColCount);
                    console.log(board.columns);
                    list.cards = [];
                    col.cards.forEach(function (card) {
                        list.cards.push(card._id);
                        Card.findOne({ _id: card._id }).exec(function (err, newcard) {
                            newcard._list = list._id;
                            newcard.save();
                        })
                    });
                    list.save();
                    if(remainingColCount==0){
                        board.save();
                        console.log(board.columns);
                    }
                });
            });
            // board.save();
            // console.log(board);
            // return res.send({ success: true, board: board });
        });
        setTimeout(function(){
             Board.findOne({ _id: req.body.board._id })
            .populate({
                path: 'columns',
                populate: { path: 'cards',
                            populate: { path: 'labels members'} }
            })
            .populate({
                path: 'members'
            })
            .populate({
                path: 'labels'
            })
            .exec(function (err, board) {
                if (err) { return next(err); }
                board.title = req.body.board.title;
                board.save();
                return res.send({ success: true, board: board })
            });
        }, 200);
        // Board.update({ _id: req.body.board._id }, { $set: { columns:  }}, callback);
    } else {
        return res.send({ success: false, flash: 'Not Authenticated' });
    }
}

exports.getBoard = (req, res) => {
    if (req.user) {
        Board.findOne({ _id: req.params.id })
            .populate({
                path: 'columns',
                populate: { path: 'cards',
                            populate: { path: 'labels members' } }
            })
            .populate({
                path: 'members'
            })
            .populate({
                path: 'labels'
            })
            .exec(function (err, board) {
                if (err) { return next(err); }
                return res.send({ success: true, board: board })
            });
    } else {
        return res.send({ success: false, flash: 'Not Authenticated' });
    }
}

exports.getBoards = (req, res) => {
    if (req.user) {
        User.findOne({ _id: req.user._id })
            .populate('boards')
            .populate('colabs')
            .exec(function (err, user) {
                if (err) { console.log(err); return next(err); };
                return res.send({ success: true, boards: user.boards, colabs: user.colabs });
            });
        // Board.find({ _owner: req.user._id }, function(err, result){
        //     // console.log(result);
        //     // console.log(boards);
        //     if (err) { console.log(err); return next(err); };
        //     return res.send({ success: true, boards: result }); 
        // });
    } else {
        return res.send({ success: false, flash: 'Not Authenticated' });
    }
}

exports.getColabBoards = (req, res) => {
    if (req.user) {
        User.findOne({ _id: req.user._id })
            .populate('colabs')
            .exec()
        Board.find({ _owner: req.user._id }, function (err, result) {
            // console.log(result);
            // console.log(boards);
            if (err) { console.log(err); return next(err); };
            return res.send({ success: true, boards: result });
        });
    } else {
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
            .exec(function (err, board) {
                if (err) { console.log(err); return next(err); };
                board.columns.push(list._id);
                board.save();
                return res.send({ success: true, list: list });
            });
    } else {
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
            .exec(function (err, list) {
                if (err) { console.log(err); return next(err); };
                list.cards.push(card._id);
                list.save();
                return res.send({ success: true, card: card });
            });
    } else {
        return res.send({ success: false, flash: "Not Authenticated" });
    }
}

exports.postLabel = (req, res) => {
    if (req.user) {
        let label = new Label;
        label._board = req.body.boardId;
        label.title = req.body.label.title;
        label.color = req.body.label.color;
        label.save();
        console.log(req.body.label);
        console.log(label);
        Board.findOne({ _id: req.body.boardId })
            .exec(function (err, board) {
                if (err) { console.log(err); return next(err); };
                board.labels.push(label._id);
                board.save();
                return res.send({ success: true, label: label });
            });
    } else {
        return res.send({ success: false, flash: "Not Authenticated" });
    }
}

exports.deleteLabel = (req, res) =>{
    if(req.user) {
        let deletedId = req.params.id;
        Label.findOne({ _id: deletedId })
        .exec(function(err, label){
            if (err) { console.log(err); return next(err); };
            console.log(label);
            Board.findOne({ _id: label._board })
            .exec(function(err, board){
                if (err) { console.log(err); return next(err); };
                console.log(board);
                let newLabels = [];
                board.labels.forEach(function(doc){
                    let found = false;
                    if(doc.toString() != label._id.toString()){
                        newLabels.push(doc);
                    }
                });
                board.labels = newLabels;
                console.log(newLabels);
                board.save();
                label.remove();
                return res.send({ success: true });
            });
        });
    }
}

exports.getLabels = (req, res) => {
    if (req.user) {
        Label.find({ _board: req.params.id })
            .exec(function (err, labels) {
                if (err) { console.log(err); return next(err); };
                return res.send({ success: true, labels: labels });
            });
    } else {
        return res.send({ success: false, flash: "Not Authenticated" });
    }
}

exports.putList = (req, res) => {
    if (req.user) {
        List.findOne({ _id: req.body.list._id })
            .populate({ path: 'cards', populate: { path: 'labels members' }})
            .exec(function (err, list) {
                if (err) { console.log(err); return next(err); };
                list.title = req.body.list.title;
                list.save();
                return res.send({ success: true, list: list });
            });
    } else {
        return res.send({ success: false, flash: "Not Authenticated" });
    }
}


exports.putCard = (req, res) => {
    if (req.user) {
        Card.findOne({ _id: req.body.card._id })
            .exec(function (err, card) {
                if (err) { console.log(err); return next(err); };
                let newcard = req.body.card;
                console.log(newcard);
                let members = [];
                let comments = [];
                let labels = [];
                if (newcard.members.length > 0 && typeof newcard.members[0] === 'object') {
                    newcard.members.forEach(function (member) {
                        members.push(member._id);
                    });
                    card.members = members;
                }
                if (newcard.comments.length > 0 && typeof newcard.comments[0] === 'object') {
                    newcard.comments.forEach(function (comment) {
                        comments.push(comment._id);
                    });
                    card.comments = comments;
                }
                if (newcard.labels.length > 0 && typeof newcard.labels[0] === 'object') {
                    newcard.labels.forEach(function (label) {
                        labels.push(label._id);
                    });
                    card.labels = labels;
                }
                card.title = newcard.title;
                card.description = newcard.description;
                card.duedate = newcard.duedate;
                card.attachments = newcard.attachments;
                card.save();
                return res.send({ success: true, card: card });
            });
    } else {
        return res.send({ success: false, flash: "Not Authenticated" });
    }
}

exports.postComment = (req, res) => {
    if (req.user) {
        Card.findOne({ _id: req.body.cardId })
            .exec(function (err, card) {
                let comment = new Comment;
                comment.body = req.body.comment;
                comment.author = req.user._id;
                comment.save();
                card.comments.push(comment._id);
                card.save();
                return res.send({ success: true, card: card });
            });
    } else {
        return res.send({ success: false, flash: "Not Authenticated" });
    }
}

exports.getCard = (req, res) => {
    if (req.user) {
        Card.findOne({ _id: req.params.id })
            .populate({
                path: 'comments',
                populate: { path: 'author' }
            })
            .populate({ path: 'members' })
            .populate({ path: 'labels' })
            .exec(function (err, card) {
                return res.send({ success: true, card: card })
            });
    } else {
        return res.send({ success: false, flash: "Not Authenticated" });
    }
}
