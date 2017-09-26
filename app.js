
/**
 * A simple AngularJS component to display an image with customized attributes.
 * Not an incredibly useful example of a component here, but whatever.. :)
 * 
 * @binding {string} source - One-way bound object that contains <p/>
 * an image URL.
 * @binding {string} [title] - One-way bound string that populates the <p/>
 * alt tag.
 * @binding {string} [cssClass] - One-time bound string to customize <p/>
 * the class attribute of the image. *
 * 
 * More component questions see: https://docs.angularjs.org/guide/component
 */ 
let _imgComponentDefinition = {
    bindings: {
        source: '<',
        imgTitle: '<?',
        cssClass: '@?'
    },
    controller: ImgComponentController,
    template: `
        <img 
            ng-cloak
            ng-src="{{ $ctrl.source }}" 
            alt="{{ $ctrl.imgTitle }}"
            ng-class="$ctrl.cssClass" />`
}

// Just some default checks for the optional bindings.
function ImgComponentController($log, utilityFactory) {
    
    // $onInit is required to initialize bindings in 1.6+.
    this.$onInit = () => {
        this.imgTitle = this.imgTitle || '';
        this.cssClass = this.cssClass || 'img-responsive';
    };
}

/**
 * The host controller that will provide a launching point for the page.
 * 
 * @param {object} apiFactory - The local project service for providing <p/>
 * endpoints to NASA's API.
 * @param {object} $log - The AngularJS logging service.
 * 
 * More controller questions, see: https://docs.angularjs.org/guide/controller
 */
function HomeController(apiFactory, $log) {
    // two-way bound object to fill out the view.
    this.pictureModel = {};

    /**
     * Executes the apiFactory function "getPictureOfTheDay". <p/>
     * Then waits for the resolve or rejection from the API request. <p/>
     * And finally, will populate the pictureModel or simply log an error.
     * 
     * More $http questions, see: https://docs.angularjs.org/api/ng/provider/$httpProvider
     */ 
    apiFactory
        .getPictureOfTheDay()
        .then((response) => {
            // When the API request returns 200 http status and <p/>
            // has a valid response.data object then it will bind <p/>
            // to the pictureModel property of the $controller object.
            if (response.data) {
                this.pictureModel = response.data;    
            }
        })
        .catch((reason) => {
            // Just a pretty wrapper around console.error().
            $log.error(reason);    
        });
}

/**
 * The angular factory to access the NASA API endpoint for <p/>
 * "The Picture of the Day" (aka. TPOD).
 * 
 * @param {object} $http - The AngularJS HTTP service.
 * 
 * @returns {*} Returns a promise of an object containing endpoints <p/>
 * to the NASA API.
 * 
 * More service/factory questions, see: https://docs.angularjs.org/guide/services
 */ 
function ApiFactory($http) {
    let service = {};
    
    service.getPictureOfTheDay = () => {
        return $http.get('https://api.nasa.gov/planetary/apod?api_key=PktCmLMUs4RKW1wMlhv4b5eqjN4T2GuHe5zfkEKA');
    };
    
    return service;
}

/**
 * A simple utility factory to house future useful functions for myself.
 *
 * @param {object} $log - The AngularJS logging service.
 * 
 * @returns {object} Returns an object of the Utility factory.
 */
function UtilityFactory($log) {
    let service = {};
    
    /**
     * Tells me, rather crudely I must admit, if the string is from youtube.
     * 
     * @param {string} url - the url string to parse.
     * 
     * @returns {boolean} - Returns if the string is from youtube.\
     */
    service.isYouTubeUrl = (url) => {
        if (url) {
            return url.indexOf('youtube') > 0;
        }
        
        $log.info('A url is required.');
    };
    
    return service;
}

/**
 * The Angular module definition.
 */
angular
    .module('nasa', [])
    .factory('utilityFactory', UtilityFactory)
    .factory('apiFactory', ApiFactory)
    .component('imgComponent', _imgComponentDefinition)
    .controller('homeController', HomeController);
    
/**
 * Bootstrapping the "nasa" AngularJS module to the document DOM object. <p/>
 * You can use ngApp directive on the view to accomplish the same thing.
 */ 
angular
    .bootstrap(document, ['nasa']);
