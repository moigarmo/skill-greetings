
const Alexa = require('ask-sdk');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const languageStrings = {
    'en': require('./languages/en'),
    'es': require('./languages/es')
}

const LaunchRequest = {
    canHandle(handlerInput) {
        return Alexa.isNewSession(handlerInput.requestEnvelope)
            || Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const reprompt = requestAttributes.t('LAUNCH_MESSAGE');

        return handlerInput.responseBuilder
            .speak(reprompt)
            .reprompt(reprompt)
            .getResponse();
    },
};

const SessionEndedRequest = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    },
};

const HelpIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const reprompt = requestAttributes.t('HELP_MESSAGE');

        return handlerInput.responseBuilder
            .speak(reprompt)
            .reprompt(reprompt)
            .getResponse();
    },
};

const ExitHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        return handlerInput.responseBuilder
            .speak(requestAttributes.t('EXIT_MESSAGE'))
            .getResponse();
    },
};

const NameIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NameIntent';
    },
    async handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'name');

        return handlerInput.responseBuilder
            .speak(requestAttributes.t('GREET_MSG', name))
            .getResponse();
    },
};


const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            fallbackLng: 'es',
            resources: languageStrings
        });

        localizationClient.localize = function () {
            const args = arguments;
            let values = [];

            for (var i = 1; i < args.length; i++) {
                values.push(args[i]);
            }
            const value = i18n.t(args[0], {
                returnObjects: true,
                postProcess: 'sprintf',
                sprintf: values
            });

            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)];
            } else {
                return value;
            }
        }

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function (...args) {
            return localizationClient.localize(...args);
        };
    },
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequest,
        HelpIntent,
        ExitHandler,
        SessionEndedRequest,
        NameIntent
    )
    .addRequestInterceptors(LocalizationInterceptor)
    .lambda();
