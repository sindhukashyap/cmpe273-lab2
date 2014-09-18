var connect = require('connect');
var login = require('./login');
var http = require('http'); 
var app = connect();


app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main); //function main intersepts every request at path '/' of server


function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) 
{
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) 
	{
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) 
		{
			
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.setHeader("Content-Type", "text/html");
			response.end(login.hello(sid));	
		} else
		 {
			response.end("Invalid session_id! Please login again\n");
		}
	} 
	else 
	{
		response.end("Please login via HTTP POST\n");
	}
};

function post(request, response) 
{
	// read 'name and email from the request.body'
	var name = request.body.name;
	var email = request.body.email;

	var newSessionId = login.login(name,email);
	var cookies = request.cookies;
	// set new session id to the 'session_id' cookie in the response
	response.setHeader('Set-Cookie','session_id =' + newSessionId);
	response.setHeader("Content-Type", "text/html");
	response.end(login.hello(newSessionId));
};

function put(request, response) 
{
	console.log("PUT:: Re-generate new seesion_id for the same user");
	//  refresh session id; similar to the post() function
	
	var cookies = request.cookies;
	console.log(cookies);
	var sid = cookies['session_id'];
	console.log("Put "+sid);
	if ( login.isLoggedIn(sid) ) 
	{
		var newSessionId = login.login(login.sessionMap[sid].name,login.sessionMap[sid].email);
			
	}
	else
	{
		response.end("Invalid session_id! Please login again\n");
	}

	response.setHeader('Set-Cookie','seesion_id =' + newSessionId);
	response.setHeader("Content-Type", "text/html");
	response.end(login.hello(newSessionId));
	response.end("Re-freshed session id\n");
};

function del(request, response) {
	console.log("DELETE:: Logout from the server");
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) 
	{
		var sid = cookies['session_id'];
	}
	login.logout(sid);

 	// remove session id via login.logout(xxx)
 	// No need to set session id in the response cookies since you just logged out!
 	response.setHeader("Content-Type", "text/html");
  	response.end('Logged out from the server\n');
};
//creating a server and making it ready to listen
http.createServer(app).listen(8000);
console.log("Node.JS server running at 8000...");


