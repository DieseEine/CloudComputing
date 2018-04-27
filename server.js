var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = {};
connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server running ...');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);
	
	//disconnect
	socket.on('disconnect', function(data){
		delete users[socket.username];
		io.sockets.emit('new message', {msg: 'disconnected', user: socket.username, date: new Date()});
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
		
	});
	
	
	//Send Message
	socket.on('send message', function(data, callback){
		var msg = data.trim();
		if(msg.substr(0,4) === '/pm '){
			msg = msg.substr(4);
			var ind = msg.indexOf(' ');
			if(ind !== -1){
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				if(name in users){
					users[name].emit('private message', {msg: msg, user: socket.username, date: new Date()});
				} else{
					callback('User not found!');
				}
			} else{
				callback('PM not found!');
			}
		} else{
			io.sockets.emit('new message', {msg: msg, user: socket.username, date: new Date()});
		}
	});
	
	//new user
	socket.on('new user', function(data, callback){
		if(data in users){
			callback(false);
		} else{
			callback(true);
			socket.username = data;
			users[socket.username]=socket;
			updateUsernames();
			io.sockets.emit('new message', {msg: 'joined the server', user: socket.username, date: new Date()});
		}
	});

	function updateUsernames(){
		io.sockets.emit('get users', Object.keys(users));
	}
	
	
let ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
let bodyParser = require('body-parser');

require('dotenv').config({silent: true});

// Create the service wrapper
let toneAnalyzer = new ToneAnalyzerV3({
  version_date: '2017-09-21',
});

app.use(bodyParser.json());

app.use(express.static('public'));

function createToneRequest (request) {
  let toneChatRequest;

  if (request.texts) {
    toneChatRequest = {utterances: []};

    for (let i in request.texts) {
      let utterance = {text: request.texts[i]};
      toneChatRequest.utterances.push(utterance);
    }
  }

  return toneChatRequest;
}

function happyOrUnhappy (response) {
  const happyTones = ['satisfied', 'excited', 'polite', 'sympathetic'];
  const unhappyTones = ['sad', 'frustrated', 'impolite'];

  let happyValue = 0;
  let unhappyValue = 0;

  for (let i in response.utterances_tone) {
    let utteranceTones = response.utterances_tone[i].tones;
    for (let j in utteranceTones) {
      if (happyTones.includes(utteranceTones[j].tone_id)) {
        happyValue = happyValue + utteranceTones[j].score;
      }
      if (unhappyTones.includes(utteranceTones[j].tone_id)) {
        unhappyValue = unhappyValue + utteranceTones[j].score;
      }
    }
  }
  if (happyValue >= unhappyValue) {
    return 'happy';
  }
  else {
    return 'unhappy';
  }
}

/* Example 
{
  "texts": ["I do not like what I see", "I like very much what you have said."]
}
*/
app.post('/tone', (req, res, next) => {
  let toneRequest = createToneRequest(req.body);

  if (toneRequest) {
    toneAnalyzer.tone_chat(toneRequest, (err, response) => {
      if (err) {
        return next(err);
      }
      let answer = {mood: happyOrUnhappy(response)};
      return res.json(answer);
    });
  }
  else {
    return res.status(400).send({error: 'Invalid Input'});
  }
});
	
});



