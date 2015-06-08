var models = require('../models/models.js');

// Autoload :id
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
	    res.render('quizes/index', {quizes: quizes, errors: []});
	}
    ).catch(function(error) { next(error); });
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', {quiz: req.quiz, errors: []});
};            // req.quiz: instancia de quiz cargada con autoload

// GET /quizes/:id/answer
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if(req.query.respuesta === req.quiz.respuesta){
	resultado = 'Correcto';
    }
    res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res) {
    var quiz = models.Quiz.build( // crea objeto quiz
	{pregunta: "Pregunta", respuesta: "Respuesta" }
    );

    res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
    var quiz = models.Quiz.build(req.body.quiz);

    quiz
	.validate()
	.then(
	    function(err) {
		if(err) {
		    res.render('quizes/new', {quiz: quiz, errors: err.errors});
		} else {
		    quiz // save: guarda en DB campos pregunta y respuesta de quiz
			.save({fields: ["pregunta", "respuesta"]})
			.then(function() { res.redirect('/quizes'); });
		}            // res.redirect: redirección HTTP a lista de preguntas
	    }
	);
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
    var quiz = req.quiz; // req.quiz: autoload de instancia de quiz

    res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
    req.quiz.pregunta = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;

    req.quiz
	.validate()
	.then(
	    function(err) {
		if(err) {
		    res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
		} else {
		    req.quiz // save: guarda en DB campos pregunta y respuesta de quiz
			.save({fields: ["pregunta", "respuesta"]})
			.then(function() { res.redirect('/quizes'); });
		}            // res.redirect: redirección HTTP a lista de preguntas
	    }
	);
};
