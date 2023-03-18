require("console-stamp")(console, 'HH:MM:ss.l');

const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://homebridge:1883");

function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa( binary );
}

client.on('connect', () => {

	console.log("connected.");
	
	client.subscribe('/pushover', (err) => {
		if ( err ){
			console.error("Connection Error:", err);
		} else {
			console.log("subscribed to topic /pushover");
		}
	});
	
});

client.on('message', async (topic, message) => {

	const obj = JSON.parse(message);

	if ( !obj.token ){
		console.error("token is required");
	} else if ( !obj.user ){
		console.error("user is required");
	} else if ( !obj.message ){
		console.error("message is required");
	} else {
		
		// it's valid
		
		if ( obj.jpgurl ){
			console.log("fetching jpgurl", obj.jpgurl);
			try {
				const jpgResponse = await fetch(obj.jpgurl, { signal: AbortSignal.timeout(5000) } );
				if ( jpgResponse.ok ){
					console.log("got jpg ok from ", obj.jpgurl);
					const jpgData = arrayBufferToBase64( await jpgResponse.arrayBuffer() );
					obj.attachment_base64 = jpgData;
					obj.attachment_type = "image/jpeg";
				}
			} catch (err){
				console.error("error retrieving image", err);		
			}
			delete obj.jpgurl;
		}

		const body = JSON.stringify(obj);

		console.log("Pushing: ", body);

		const response = await fetch('https://api.pushover.net/1/messages.json', {method: 'POST', body: body, headers: { "Content-Type":"application/json" } });
		const data = await response.json();

		console.log(data);
	}

});
