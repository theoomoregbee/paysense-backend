/**
 * this is used to handle saving and manipulation of generated text files
 */
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');

const textToSpeech = new TextToSpeechV1({
    username: 'f678265e-d206-409f-be16-631c84ff1263',
    password: 'P5FdTN4QC3cp',
});

module.exports = {
    /**
     * this converts text entered to an audio and saves the audio to a file
     * @param text 
     */
    convert: (text) => {
        var params = {
            text: text,
            voice: 'en-US_AllisonVoice',
            accept: 'audio/wav'
        };
  
        // Pipe the synthesized text to a file.
        textToSpeech.synthesize(params).on('error', function (error) {
            if (error) console.error(error);
        }).pipe(fs.createWriteStream(require('path').resolve(sails.config.appPath, 'assets/voices') + '/voice.wav'));
        console.log("done generating speech");
    }
}