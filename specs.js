describe('The complete suite of testing specs for my NASA "The Picture of the Day" page.', () => {
    /* variables to house the services that will drive the tests. */
    let $httpBackend, $scope, $controller, $componentController, $log,
        apiFactory, comCtrl, ctrl, utilityFactory;
    
    /* jasmine.beforeEach will execute before each "it" test within it's describe scope. */
    beforeEach(() => {
        /* Need to first mock the module we wish to test. */
        module('nasa');
        
        /*
            We need a few services injected into our tests for setup <p/>
            and testing purposes.  If you plan on using the same <p/>
            name as the said injected service in your tests... <p/>
            use underscore wrapping as shown.
         */
        inject((
            _$httpBackend_,
            _$rootScope_,
            _$controller_,
            _$componentController_,
            _$log_,
            _apiFactory_,
            _utilityFactory_
        ) => {
            /* This is a nice service for mocking the $http service. */
            $httpBackend = _$httpBackend_;
            
            /* Creating a new $scope object off the parent $rootScope. */
            $scope = _$rootScope_.$new();
            
            /**
             *  We're going to need to test the controller so we need to <p/>
             *  inject the angular-mocks $controller service.
             */
            $controller = _$controller_;
            
            /**
             * Inject the $componentController mock serivce from angular-mocks. <p/>
             * We'll need this for testing our imgComponent.
             */
            $componentController = _$componentController_;
            
            /**
             * Injects the angular-mocks $log service.  if the api call fails then this <p/>
             * service will fire so we'll need to test that.
             */
            $log = _$log_;
            
            /**
             * This is my local api factory that simply connects to the api endpoings <p/>
             * and returns a promise of a response.
             */
            apiFactory = _apiFactory_;
            
            /**
             * Just my, at the moment rather useless, utility factory <p/>
             * I'll grow it as I enhance this little project.
             */
            utilityFactory = _utilityFactory_;
        });
    });    
        
    /**
     * Creates a mock $controller of "homeController" and injects <p/>
     * some required mock services.
     */
    let _createController = () => {
        if ($controller) {
            /**
             * Creating the controller with the "ctrl" alias.  In our view,
             * this would be equivalent to "ctrl".
             */
            ctrl = $controller('homeController', {
               'apiFactory': apiFactory,
               '$log': $log
            });
        }
    }
    
    /**
     * Creates a mock $component of "imgComponent", injects a $scope <p/>
     * and adds bindings.  Remember to manually execute the $onInit function. <p/>
     * $componentController won't do that for you.
     * 
     * @param {object} bindings - Component level required & optional <p/>
     * bindings for testing.
     */ 
    let _createComponent = (bindings) => {
        if ($componentController) {
            /** 
             * $componentController takes 4 params, but we'll only use two (...ok 3) <p/>
             * params here.  $scope is not really really necessary here, <p/>
             * but we do need bindings.
             */
            comCtrl = $componentController('imgComponent', null, bindings);
            
            /**
             * $componentController will not execute this funciton for you. <p/>
             * You need to execute it manually.  I will want to do this on every <p/>
             * test so this function is a good place for it.
             */
            comCtrl.$onInit();
        }
    }
    
    /* Here come the tests! */
    
    describe('What happens when the controller "homeController" first gets executed?', () => {
        
        /**
         * Before each test, I'm going to set up a jasmine spy to watch over the <p/>
         * apiFactory's "getPictureOfTheDay" function.  When the function is called <p/>
         * the spy will tell jasmine to call through to the actual function.
         */
        beforeEach(() => {
            spyOn(apiFactory, 'getPictureOfTheDay').and.callThrough();
        });
        
        it('should make a successful attempt to call the apiFactory\'s "getPictureOfTheDay" function.', () => {
            // When the apiFactory's "GetPictureOfTheDay" function <p/>
            // executes it's $http.get.  The angular-mocks $httpBackend <p/>
            // will intercept the call and respond with a 200 and my mock object.
            $httpBackend
                .whenGET('https://api.nasa.gov/planetary/apod?api_key=PktCmLMUs4RKW1wMlhv4b5eqjN4T2GuHe5zfkEKA')
                .respond(200, { 
                    'imgTitle': 'Something interesting',
                    'url': 'something.jpg',
                    'date': '4/15/2017 2:00:00PM',
                    'explanation': 'pretend this is a lot of text.'
                });
            
            // Since the apiFactory call is executed as soon as the $controller <p/>
            // is initalized, we need to create the controller now.
            _createController();
            
            // The mocks $httpBackend "flush" function "executes" the $http.get <p/>
            // function and returns the desired response and the "then/catch/finally" <p/>
            // callbacks are executed.
            $httpBackend.flush();
            
            // pretty self explanatory here, but 
            expect(apiFactory.getPictureOfTheDay).toHaveBeenCalled();
            
            // The whole point of the controller is to populate the
            // two-way bound pictureModel.  So let's test that.  <p/>
            // it should the same as what the mock $httpBackend service <p/>
            // responded with.
            expect(ctrl.pictureModel).toEqual({ 
                'imgTitle': 'Something interesting',
                'url': 'something.jpg',
                'date': '4/15/2017 2:00:00PM',
                'explanation': 'pretend this is a lot of text.'
            });
        });
        
        it('should log an error if the apiFactory\'s "getPictureOfTheDay" function call fails.', () => {
            // We do not really need to call the actual $log.error function.  So just keep it as <p/>
            // an empty spy function.
            spyOn($log, 'error');
            
            $httpBackend
                .whenGET('https://api.nasa.gov/planetary/apod?api_key=PktCmLMUs4RKW1wMlhv4b5eqjN4T2GuHe5zfkEKA')
                .respond(503, { 
                    errorMessage: 'something bad happened.'
                });
            
            _createController();
            
            $httpBackend.flush();
            
            expect(ctrl.pictureModel).toEqual({});
            expect($log.error).toHaveBeenCalled();
        });
    });
    
    describe('What happens when I execute an "imgComponent" component?', () => {
        
        describe('and give the component just the required bindings?', () => {
            
            it('should successfully have the correct binding $onInit.', () => {
                _createComponent({ 'source': 'some-image-url.jpg' });
            
                expect(comCtrl.source).toBe('some-image-url.jpg');
                expect(comCtrl.imgTitle).toBe('');
                expect(comCtrl.cssClass).toBe('img-responsive');
            });
        });
        
        describe('and give the component a title and source bindings?', () => {
            
            it('should successfully have the correct bindings (source & title) $onInit().', () => {
                _createComponent({ 
                    'source': 'something-or-other.jpg',
                    'imgTitle': 'A cool picture of space.'
                });
                
                expect(comCtrl.source).toBe('something-or-other.jpg');
                expect(comCtrl.imgTitle).toBe('A cool picture of space.');
                expect(comCtrl.cssClass).toBe('img-responsive');
            });
        });
        
        describe('and give the component a title, source and cssClass bindings?', () => {
            
            it('should successfully have the correct bindings (source & title) $onInit().', () => {
                _createComponent({ 
                    'source': 'something-or-other.jpg',
                    'imgTitle': 'A cool picture of space.',
                    'cssClass': 'do-something-neat'
                });
                
                expect(comCtrl.source).toBe('something-or-other.jpg');
                expect(comCtrl.imgTitle).toBe('A cool picture of space.');
                expect(comCtrl.cssClass).toBe('do-something-neat');
            });
        });
    });
    
    // not implemented yet.  Still working on it.  Not a fan of this implementation.  Might regex this.  blah.
    describe('Let us do some testing on the Utility factory.  Shh shh shh, This won\'t hurt a bit.', () => {
        
        describe('What happens when I send this function a url?', () => {
            
            describe('and it is a youtube url.', () => {
                it('should return with a true value.', () => {
                    expect(utilityFactory.isYouTubeUrl('something.youtube.com')).toBeTruthy();
                });
            });
            
            describe('and it is an image url.', () => {
                it('should return with a false value.', () => {
                    expect(utilityFactory.isYouTubeUrl('something.jpg')).toBeFalsy();
                });
            });
        });
    });
});
