var models = require('../models/models.js');

// Esta variable debería ir a DB en futuras versiones
// El nombre de la propiedad es lo que se guarda en BD
// El valor de la propiedad es lo que se muestra en la interfaz
var temas = {
    otro: 'Otro',
    humanidades: 'Humanidades',
    ocio: 'Ocio',
    ciencia: 'Ciencia',
    tecnologia: 'Tecnología'
};

// Autoload :id
exports.load = function(req, res, next, quizId) {
    models.Quiz.findAll({
	where: {id: Number(quizId)},
	include: [{model: models.Comment}]
    }).then(
	function(quiz) {
	    if(quiz) {
		req.quiz = quiz[0];
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
	    res.render('quizes/index', {quizes: quizes, temas: temas, errors: []});
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
	{pregunta: "Pregunta", respuesta: "Respuesta", tema: "otro" }
    );

    res.render('quizes/new', {quiz: quiz, temas: temas, errors: []});
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
			.save({fields: ["pregunta", "respuesta", "tema"]})
			.then(function() { res.redirect('/quizes'); });
		}            // res.redirect: redirección HTTP a lista de preguntas
	    }
	).catch(function(error){ next(error); });

};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
    var quiz = req.quiz; // req.quiz: autoload de instancia de quiz

    res.render('quizes/edit', {quiz: quiz, temas: temas, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
    req.quiz.pregunta = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.tema = req.body.quiz.tema;

    req.quiz
	.validate()
	.then(
	    function(err) {
		if(err) {
		    res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
		} else {
		    req.quiz // save: guarda en DB campos pregunta y respuesta de quiz
			.save({fields: ["pregunta", "respuesta", "tema"]})
			.then(function() { res.redirect('/quizes'); });
		}            // res.redirect: redirección HTTP a lista de preguntas
	    }
	).catch(function(error){ next(error); });

};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
    req.quiz.destroy().then(function() {
	res.redirect('/quizes');
    }).catch(function(error){ next(error); });
};

// GET /quizes/statistics
exports.statistics = function(req, res) {
    var statistics = {
	numquizes: {texto: 'Número de preguntas', info: 0},
	numcomments: {texto: 'Número de comentarios totales', info: 0},
	avgcomments: {texto: 'Número medio de comentarios por pregunta', info: 0},
	withoutcomments: {texto: 'Número de preguntas sin comentarios', info: 0},
	withcomments: {texto: 'Número de preguntas con comentarios', info: 0}
    };
    // número de preguntas
    models.Quiz.count().then(function(numquizes) {
	statistics.numquizes.info = numquizes;
	// número de comentarios totales
	models.Comment.count().then(function (numcomments) {
	    statistics.numcomments.info = numcomments;
	    // número medio de comentarios por pregunta
	    var avgcomments = numcomments / numquizes;
	    statistics.avgcomments.info = avgcomments.toFixed(2);
	    // número de preguntas con comentarios
	    models.Quiz.count({distinct: true, include: [{model: models.Comment, required: true}]}).then(function(withcomments) {
		statistics.withcomments.info = withcomments;
		// número de preguntas sin comentarios
		statistics.withoutcomments.info = numquizes - withcomments;
		// Mostrar página con las estadísticas
		res.render('quizes/statistics', {statistics: statistics, errors: []});
	    });
	});
    }).catch(function(error) { next(error); });
    
};