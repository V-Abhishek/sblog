const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	expressSanitizer = require('express-sanitizer'),
	mongoose = require('mongoose');

// Application Configuaration
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static('public'));

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/sblog_db');

// Mongoose Model/Schema Configuaration
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now } //Set default date
});

var Blog = mongoose.model('Blog', blogSchema);
/*
Blog.create(
	{
		title: 'Test',
		image:
			'https://images.unsplash.com/photo-1588818542141-ccc9fdd28211?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=638&q=80',
		body: 'This is a test blog'
	},
	function(err, blog) {
		if (err) {
			console.log(err);
		} else {
			console.log(blog);
		}
	}
);
*/
app.get('/', function(req, res) {
	res.redirect('/blogs');
});

//INDEX Route
app.get('/blogs', function(req, res) {
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log(err);
		} else {
			res.render('index', { blogs: blogs });
		}
	});
});

//New Route
app.get('/blogs/new', function(req, res) {
	res.render('new-blog');
});

//CREATE Route
app.post('/blogs', function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, blog) {
		if (err) {
			res.render('new-blog');
		} else {
			res.redirect('/blogs');
		}
	});
});

//SHOW Route
app.get('/blogs/:id', function(req, res) {
	Blog.findById(req.params.id, function(err, blog) {
		if (err) {
			console.log(err);
		} else {
			res.render('blog', { blog: blog });
		}
	});
});

//EDIT Route
app.get('/blogs/:id/edit', function(req, res) {
	Blog.findById(req.params.id, function(err, blog) {
		if (err) {
			console.error(err);
		} else {
			res.render('edit-blog', { blog: blog });
		}
	});
});

//Update Route
app.put('/blogs/:id', function(req, res) {
	let id = req.params.id;
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(id, req.body.blog, function(err, updatedBlog) {
		if (err) {
			console.err(err);
		} else {
			res.redirect('/blogs/' + id);
		}
	});
});

//DELETE Route
app.delete('/blogs/:id', function(req, res) {
	let id = req.params.id;
	Blog.findByIdAndRemove(id, function(err) {
		if (err) {
			console.err(err);
		} else {
			res.redirect('/blogs');
		}
	});
});

app.get('*', function(req, res) {
	res.send('Sorry, page not found!!!');
});

app.listen(3000, function() {
	console.log('Server Started Successfully');
});
