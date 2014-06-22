require.config({
  baseUrl: './'
  ,shim: {
    underscore: {
      exports: '_'
    }
    ,backbone: {
      deps: [
        'underscore'
        ,'jquery'
      ]
      ,exports: 'Backbone'
    }
    ,'jquery-mousewheel': {
      deps: [
        'jquery'
      ]
    }
    ,'jquery-dragon': {
      deps: [
        'jquery'
      ]
    }
    ,'jquery-dragon-slider': {
      deps: [
        'jquery'
        ,'jquery-dragon'
      ]
    }
    ,'jquery-cubelet': {
      deps: [
        'jquery'
      ]
    }
  },
  paths: {
    jquery: 'bower_components/jquery/jquery'
    ,'jquery-mousewheel': 'bower_components/jquery-mousewheel/jquery.mousewheel'
    ,'jquery-dragon': 'bower_components/jquery-dragon/src/jquery.dragon'
    ,'jquery-dragon-slider':
        'bower_components/jquery-dragon/src/jquery.dragon-slider'
    ,'jquery-cubelet': 'bower_components/jquery-cubelet/dist/jquery.cubelet'
    ,backbone: 'bower_components/backbone/backbone'
    ,underscore: 'bower_components/underscore/underscore'
    ,'underscore.jck':
        'bower_components/jck-library-extensions/src/underscore/underscore.jck'
    ,shifty: 'bower_components/shifty/dist/shifty'
    ,rekapi: 'bower_components/rekapi/dist/rekapi'
    ,'rekapi-scrubber': 'bower_components/rekapi-controls/src/rekapi-scrubber'
    ,mustache: 'bower_components/mustache/mustache'
    ,bezierizer: 'bower_components/bezierizer/dist/bezierizer'

    // jck-extensions
    /* jshint maxlen: 120 */
    ,'auto-update-textfield':
        'bower_components/jck-library-extensions/src/backbone/auto-update-textfield/auto-update-textfield'
    ,'incrementer-field':
        'bower_components/jck-library-extensions/src/backbone/incrementer-field/incrementer-field'
    ,'tabs': 'bower_components/jck-library-extensions/src/backbone/tabs/tabs'
    ,'pane': 'bower_components/jck-library-extensions/src/backbone/pane/pane'
    ,'alert': 'bower_components/jck-library-extensions/src/backbone/alert/alert'
  }
});

require([
  // Libraries
  'jquery'
  ,'underscore'
  ,'backbone'
  ,'shifty'
  ,'rekapi'

  // Extensions
  ,'tabs'
  ,'pane'
  ,'alert'
  ,'auto-update-textfield'

  // Misc
  ,'src/app'
  ,'src/constants'
  ,'src/utils'

  // Views
  ,'src/ui/checkbox'
  ,'src/ui/ease-select'
  ,'src/ui/fps-slider'
  ,'src/ui/canvas'
  ,'src/ui/css-output'
  ,'src/ui/html-input'
  ,'src/ui/custom-ease'
  ,'src/ui/modal'
  ,'src/ui/hotkey-handler'
  ,'src/ui/rekapi-controls'
  ,'src/ui/save'
  ,'src/ui/load'
  ,'src/ui/orientation-controls'

  // Models
  ,'src/model/animation'

  // Collections
  ,'src/collection/actors'

  // jQuery plugins that get loaded but not actually used as AMD modules.
  // These don't have a matching callback parameter.
  ,'jquery-mousewheel'
  ,'jquery-dragon'
  ,'jquery-dragon-slider'
  ,'jquery-cubelet'

  // Doesn't return anything
  ,'underscore.jck'

], function (

  $
  ,_
  ,Backbone
  ,Tweenable
  ,Rekapi

  ,TabsView
  ,PaneView
  ,AlertView
  ,AutoUpdateTextFieldView

  ,app
  ,constant
  ,util

  ,CheckboxView
  ,EaseSelectView
  ,FPSSliderView
  ,CanvasView
  ,CSSOutputView
  ,HTMLInputView
  ,CustomEaseView
  ,ModalView
  ,HotkeyHandlerView
  ,RekapiControlsView
  ,SaveView
  ,LoadView
  ,OrientationControlsView

  ,AnimationModel

  ,ActorCollection

) {

  'use strict';

  var $win = $(window);
  var $body = $(document.body);

  app.config.queryString = util.getQueryParams();

  // The styling of the <select>s only works in WebKit under OS X.  Do some
  // user agent sniffing and add some top-level classes.
  //
  // TODO: Find a better way to do this that doesn't involve user agent
  // sniffing...
  if (navigator.userAgent.match(/Macintosh/)) {
    $body.addClass('mac');
  }

  if (navigator.userAgent.match(/WebKit/)) {
    $body.addClass('webkit');
  }

  if (navigator.userAgent.match(/iphone/i)) {
    $body.addClass('iphone');
  }

  app.view.hotkeyHandler = new HotkeyHandlerView({
    '$el': $(document.body)
  });

  app.view.helpModal = new ModalView({
    '$el': $('#help-contents')
    ,'$triggerEl': $('#help-trigger')
  });

  app.$el.animationIteration = $('#iterations');

  var halfCrossHairHeight = $('#crosshairs .crosshair:first').height() / 2;
  var crosshairStartingY = ($win.height() / 2) - halfCrossHairHeight;

  var $rekapiCanvas = $('#rekapi-canvas');
  app.rekapi = new Rekapi($rekapiCanvas[0]);

  app.collection.actors = new ActorCollection();
  app.rekapi.on('addActor',
      _.bind(app.collection.actors.syncFromAppRekapi, app.collection.actors));

  app.rekapi.addActor({
    context: $('#rekapi-canvas').children()[0]
  });

  var winWidth = $win.width();
  var currentActorModel = app.collection.actors.getCurrent();

  // Create the initial keyframes.
  _.each([0, constant.INITIAL_ANIMATION_DURATION], function (millisecond, i) {
    currentActorModel.keyframe(millisecond, {
      'x': i
        ? winWidth - (winWidth / (i + 1))
        : 60 // TODO: Should this be a constant?
      ,'y': crosshairStartingY
      ,'rX': 0
      ,'rY': 0
      ,'rZ': 0
    }, 'linear linear linear linear linear');
  });

  app.view.canvas = new CanvasView({
    '$el': $('#rekapi-canvas')
    ,'$canvasBG': $('#tween-path')
  });

  app.view.rekapiControls = new RekapiControlsView();

  if (!app.config.queryString.debug) {
    app.rekapi.play();
  }

  app.view.showPath = new CheckboxView({
    '$el': $('#show-path')
    ,'callHandlerOnInit': true
    ,'onChange': function (evt, checked) {
      app.config.isPathShowing = !!checked;
      app.rekapi.update();
      app.view.canvas.backgroundView.update();
    }
  });

  app.view.controlPane = new PaneView({
    'el': document.getElementById('control-pane')
  });

  app.view.controlPaneTabs = new TabsView({
    'el': document.querySelector('#control-pane')
  });

  app.view.cssOutput = new CSSOutputView({
    '$el': $('#css-output textarea')
    ,'$trigger': app.view.controlPaneTabs.$el
        .find('[data-target="css-output"]')
  });

  app.view.fpsSlider = new FPSSliderView({
    '$el': $('.quality-slider.fps .slider')
  });

  Backbone.on(constant.UPDATE_CSS_OUTPUT, function () {
    app.view.cssOutput.renderCSS();
  });

  var autoUpdateTextFieldView = new AutoUpdateTextFieldView({
    'el': document.getElementById('css-name')
  });

  autoUpdateTextFieldView.onKeyup = function (val) {
    app.config.className = val;
    Backbone.trigger(constant.UPDATE_CSS_OUTPUT);
  };

  // onKeyup is being overridden, so re-bind the delegated listeners.
  autoUpdateTextFieldView.delegateEvents();

  app.view.cssNameField = autoUpdateTextFieldView;

  app.view.mozCheckbox = new CheckboxView({
    '$el': $('#moz-toggle')
    ,'onChange': function (evt, checked) {
      app.config.activeClasses.moz = checked;
      Backbone.trigger(constant.UPDATE_CSS_OUTPUT);
    }
  });

  app.view.msCheckbox = new CheckboxView({
    '$el': $('#ms-toggle')
    ,'onChange': function (evt, checked) {
      app.config.activeClasses.ms = checked;
      Backbone.trigger(constant.UPDATE_CSS_OUTPUT);
    }
  });

  app.view.oCheckbox = new CheckboxView({
    '$el': $('#o-toggle')
    ,'onChange': function (evt, checked) {
      app.config.activeClasses.o = checked;
      Backbone.trigger(constant.UPDATE_CSS_OUTPUT);
    }
  });

  app.view.webkitCheckbox = new CheckboxView({
    '$el': $('#webkit-toggle')
    ,'onChange': function (evt, checked) {
      app.config.activeClasses.webkit = checked;
      Backbone.trigger(constant.UPDATE_CSS_OUTPUT);
    }
  });

  app.view.w3Checkbox = new CheckboxView({
    '$el': $('#w3-toggle')
    ,'onChange': function (evt, checked) {
      app.config.activeClasses.w3 = checked;
      Backbone.trigger(constant.UPDATE_CSS_OUTPUT);
    }
  });

  app.view.htmlInput = new HTMLInputView({
    '$el': $('#html-input textarea')
  });

  app.view.centerToPathCheckbox = new CheckboxView({
    '$el': $('#center-to-path')
    ,'callHandlerOnInit': true
    ,'onChange': function (evt, checked) {
      app.config.isCenteredToPath = !!checked;
      var tranformOrigin = app.config.isCenteredToPath
        ? '0 0'
        : '';
      app.view.htmlInput.$renderTarget.css(
        'transform-origin', tranformOrigin);
      Backbone.trigger(constant.ACTOR_ORIGIN_CHANGED, true);
      app.rekapi.update();
    }
  });

  app.view.customEaseView = new CustomEaseView({
    '$el': $('#custom-ease')
  });

  app.view.topLevelAlertView = new AlertView({
    'el': document.getElementById('top-level-alert')
  });
  var topLevelAlertView = app.view.topLevelAlertView;
  Backbone.on(constant.ALERT_ERROR,
      _.bind(topLevelAlertView.show, topLevelAlertView));

  var animationModel = new AnimationModel();

  app.view.saveView = new SaveView({
    '$el': $('#save-controls')
    ,'model': animationModel
  });

  app.view.loadView = new LoadView({
    '$el': $('#load-controls')
    ,'model': animationModel
  });

  app.view.orientationView = new OrientationControlsView({
    '$el': $('#orientation-controls')
  });

  $(window).trigger('resize');

  if (app.config.queryString.debug) {
    window.app = app;
  }

});
