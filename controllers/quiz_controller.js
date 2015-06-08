var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
    models.Quiz.findById(quizId).then(
	function(quiz) {
	    if(quiz) {
		req.quiz = quiz;
		next();
	    } else {
		next(new Error('No existe quizId=' + quizId));
	    }
	}
    ).catch(function(error) { next(error); });
};

// GET /quizes
exports.index = function(req, res) {
    var search = req.query.search;
    var options = {};
    // si el parámetro search tiene un valor asignado
    if(search) {
	search = search.trim(); // quitar blancos del inicio y fin
	// sustituir blancos por %
	// (si hay más de un blanco seguido se sustituye por un solo %)
	search = search.replace(/\s+/g,'%');
	search = '%' + search + '%'; // poner % al inicio y fin
	// opciones de búsqueda
	options = {where: {pregunta: {like: search}},
		   order: [['pregunta', 'ASC']]};
    }
    models.Quiz.findAll(options).then(
	function(quizes) {
	    res.render('quizes/index', {quizes: quizes});
	}
    ).catch(function(error) { next(error); });
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', {quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if(req.query.respuesta === req.quiz.respuesta){
	resultado = 'Correcto';
    }
    res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado});
};