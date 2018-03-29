'use strict';

const HELP_MESSAGE = 'You can ask a question like who\'s on first, or ' +
  'who\'s pon second.';
const HELP_REPROMPT = 'Ask a question.';
const STOP_MESSAGE = ['Goodbye!', 'So long', 'Bye.'];
const ANSWERS = {'onFirst': 'who\'s on first. ',
  'onSecond': 'what\'s on second. ',
  'onThird': 'I don\'t know is on third. ',
};


const Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.8755cec2-7b3d-463b-a4e9-cb942ca3043d';

exports.handler = (event, context) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'LaunchRequest': function() {
    let speechOutput = 'Welcome to the test skill. Ask a question.';
    let repromptSpeech = 'Ask a question.';
    this.response.speak(speechOutput)
    .listen(repromptSpeech);
    this.emit(':responseReady');
  },
  'AnswerQuestion': function() {
    const slots = this.event.request.intent.slots;
    const response = checkSlot(slots, 'question');
    let speechOutput = '';
    let repromptSpeech = 'Ask another question.';
    if (response[0]) {
      if (ANSWERS[response[0]]) {
        speechOutput = ANSWERS[response[0]];
      } else {
        console.log('got question from model: ' + response[0] +
          ', but not in ANSWERS');
        speechOutput = 'My model understands ' + response[0] +
          ', but I don\'t have an answer for that.';
      }
    } else if (response[1]) {
      console.log('got unmatched question slot from model: ' + response[1]);
      speechOutput = 'I know you asked a question about ' + response[1] +
        ', but I don\'t know the answer.';
    } else {
      console.log('got unmatched slot: ' + slots);
      speechOutput = 'I don\'t understand what you are asking.';
    }
    this.response.speak(speechOutput).listen(repromptSpeech);
    this.emit(':responseReady');
  },

  'AMAZON.HelpIntent': function() {
    const speechOutput = HELP_MESSAGE;
    const repromptSpeech = HELP_REPROMPT;
    this.response.speak(speechOutput)
    .listen(repromptSpeech);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.emit('EndSession');
  },
  'AMAZON.StopIntent': function() {
    this.emit('EndSession');
  },
  'EndSession': function() {
    this.response.speak(randomPhrase(STOP_MESSAGE));
    this.emit(':responseReady');
  },
  'Unhandled': function() {
    let speechOutput = 'Sorry, I don\'t understand what you want.';
    let repromptSpeech = 'Try again';
    this.response.speak(speechOutput)
    .listen(repromptSpeech);
    this.emit(':responseReady');
  },
};

/**
* checks slot for resolutions
* @param {Object} slots - this.event.request.intent.slots
* @param {String} slotName - name of slot to check
* @return {[string, string]} - value.name (from resolution), slotValue (literal)
*/
function checkSlot(slots, slotName) {
  const slot = slots[slotName];
  let slotID = '';
  let slotValue = (slot && slot.value) ? slot.value : '';
  let resolution = (slot && slot.resolutions &&
    slot.resolutions.resolutionsPerAuthority &&
    slot.resolutions.resolutionsPerAuthority.length > 0)
    ? slot.resolutions.resolutionsPerAuthority[0]
    : false;
  if (resolution && resolution.status.code == 'ER_SUCCESS_MATCH') {
    let resolutionValue = resolution.values[0].value;
    slotID = resolutionValue.name;
  }
  console.log('DEBUG: checkSlot ' + slotName + ' ID ' + JSON.stringify(slotID) +
    ' val '+JSON.stringify(slotValue));
  return [slotID, slotValue];
}

/**
* select and randomly return one of a list of phrases
* @param {[String]} phraseList - list of string phrases to select from
* @return {String} - selected String phrase
*/
function randomPhrase(phraseList) {
  return phraseList[Math.floor(Math.random() * phraseList.length)];
}
