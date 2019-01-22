/**
 * Text2SpeechController
 *
 * @description :: Server-side logic for managing text2speeches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');

const textToSpeech = new TextToSpeechV1({
    username: process.env.TEXT2SPEECH_USERNAME,
    password: process.env.TEXT2SPEECH_PASSWORD,
});
module.exports = {
    /**
     * this is used to get the list of voices available in our ibm text to speach api
     * GET /voices
     * @param req
     * @param res
     */
    voices: (req, res) => {
        textToSpeech.voices(null, (error, voices) => {
            if (error) res.serverError(error);

            res.ok(voices);
        });
    },
    /**
     * this is used to convert our text passed as ?text=value to speech file
     * GET /speech?text=value
     */
    speech: (req, res) => {
        // Pipe the synthesized text to a file.
        Text2SpeechService.convert(req.query.text);
        //let's return a response of done
        res.ok("done processing");
    },
    /**
     * GET /audio
     */
    getVoiceAudio: (req, res) => {
        var SkipperDisk = require('skipper-disk');
        var fileAdapter = SkipperDisk(/* optional opts */);

        // set the filename to the same file as the user uploaded
        res.set("Content-type", "audio/wav;");

        // Stream the file down
        fileAdapter.read(require('path').resolve(sails.config.appPath, 'assets/voices') + '/voice.wav')
            .on('error', function (err) {
                return res.serverError(err);
            })
            .pipe(res);
    }
};

