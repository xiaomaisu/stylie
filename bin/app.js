define("src/app",[],function(){return{config:{activeClasses:{}},constant:{},events:{},util:{},view:{},collection:{}}}),define("src/utils",[],function(){var a={};return a.init=function(a){a.util.pxToNumber=function(a){return parseInt(a,10)},a.util.trimString=function(a){return a.replace(/^\s*|\s*$/g,"")},a.util.getQueryParams=function(){var a=window.location.search.slice(1),b=a.split("&"),c={};return _.each(b,function(a){var b=a.split("=");c[b[0]]=b[1]}),c},a.util.getRotation=function(a){return parseFloat(a.attr("style").match(/rotate\((-*\d+)deg\)/)[1])},a.util.moveLastKeyframe=function(b,c){c=+c;var d=b.getTrackNames(),e=b.getTrackLength(d[0])-1;_.each(d,function(a){b.modifyKeyframeProperty(a,e,{millisecond:c})}),a.config.animationDuration=c},a.util.getFormulaFromEasingFunc=function(a){var b=a.toString().replace("\n",""),c=b.replace(/.*return\s*/g,""),d=c.replace(/\}|;\s*\}$/g,"");return d}},a}),define("src/ui/checkbox",[],function(){return Backbone.View.extend({events:{change:"_onChange"},initialize:function(a){_.extend(this,a),a.callHandlerOnInit&&(this.delegateEvents(),this.$el.trigger("change"))},_onChange:function(a){this.onChange.call(this,a,this.$el.attr("checked")==="checked")}})}),define("src/ui/select",["src/app"],function(a){function b(a){var b=a.config.selects.x.$el.val(),c=a.config.selects.y.$el.val(),d=a.config.selects.r.$el.val();return[b,c,d].join(" ")}return Backbone.View.extend({events:{change:"onChange"},initialize:function(a){_.extend(this,a),_.each(Tweenable.prototype.formula,function(a,b){var c=$(document.createElement("option"),{value:b});c.html(b),this.$el.append(c)},this)},onChange:function(c){a.config.currentActor.modifyKeyframe(a.config.animationDuration,{},{transform:b(a)}),a.view.canvas.backgroundView.update(),a.kapi.update()}})}),define("src/ui/auto-update-textfield",[],function(){return Backbone.View.extend({events:{keyup:"onKeyup",keydown:"onKeydown"},initialize:function(a){_.extend(this,a)},onKeyup:function(a){var b=this.$el.val();this.onValReenter&&this.onValReenter(b)},onKeydown:function(a){var b=a.which;b==38&&this.onArrowUp?this.onArrowUp():b==40&&this.onArrowDown&&this.onArrowDown()}})}),define("src/ui/ease-field",["src/app","src/ui/auto-update-textfield"],function(app,AutoUpdateTextFieldView){return AutoUpdateTextFieldView.extend({initialize:function(a){AutoUpdateTextFieldView.prototype.initialize.apply(this,arguments);var b=this.$el.data("easename"),c=Tweenable.prototype.formula[b],d=app.util.getFormulaFromEasingFunc(c);this.$el.val(d),this.$el.data("lastvalidfn",d)},onValReenter:function(val){var easename=this.$el.data("easename"),lastValid=this.$el.data("lastvalidfn");if(lastValid===val)return;try{eval("Tweenable.prototype.formula."+easename+" = function (x) {return "+val+"}"),this.$el.data("lastvalidfn",val),this.$el.removeClass("error"),app.view.canvas.backgroundView.update(),app.kapi.update()}catch(ex){eval("Tweenable.prototype.formula."+easename+" = function (x) {return "+lastValid+"}"),this.$el.addClass("error")}}})}),define("src/ui/crosshair",["src/app"],function(a){var b=$(window),c=['<div class="crosshair {{extraClass}}" data-pos="{{position}}" data-percent="{{percent}}">','<div class="dashmark horiz"></div>','<div class="dashmark vert"></div>','<div class="rotation-arm">','<div class="rotation-handle">',"</div>","</div>"].join(""),d=Backbone.View.extend({events:{"mousedown .rotation-arm":"onClickRotationArm"},initialize:function(a){_.extend(this,a),this.$el.dragon({within:this.$el.parent(),dragStart:_.bind(this.dragStart,this),dragEnd:_.bind(this.dragEnd,this)}),this.$el.css("transform","rotate(0deg)"),this._isRotating=!1,this.model.set("percent",+this.$el.data("percent")),this.model.crosshairView=this,this.render()},onClickRotationArm:function(a){this.startRotating(a.clientX,a.clientY),a.stopPropagation()},onMouseupRotatorArm:function(a){this.stopRotating()},onMouseMoveRotator:function(a){this.rotateForDragDelta(a.clientX,a.clientY)},onKeyupRotator:function(a){this.stopRotating()},dragStart:function(a,b){this.dimPathLine()},dragEnd:function(b,c){this.updateModel(),a.view.cssOutput.renderCSS(),publish(a.constant.UPDATE_CSS_OUTPUT)},render:function(){this.$el.css({left:this.model.get("x")+"px",top:this.model.get("y")+"px",transform:"rotate("+this.model.get("r")+"deg)"})},updateModel:function(){var b=a.util.pxToNumber;this.model.set({x:b(this.$el.css("left")),y:b(this.$el.css("top")),r:a.util.getRotation(this.$el)}),publish(a.constant.KEYFRAME_UPDATED),a.collection.keyframes.updateModelKeyframeViews(),a.kapi.update()},dimPathLine:function(){a.view.canvas.backgroundView.update(!0)},startRotating:function(a,c){this._previousRotationDragX=0,this._previousRotationDragY=0,this._currentRotationDragX=a,this._currentRotationDragY=c,this._mouseupHandler=_.bind(this.onMouseupRotatorArm,this),this._mousemoveHandler=_.bind(this.onMouseMoveRotator,this),this._keyupHandler=_.bind(this.onKeyupRotator,this),this._isRotating=!0,b.on("mouseup",this._mouseupHandler).on("mousemove",this._mousemoveHandler).on("keyup",this._keyupHandler)},stopRotating:function(){this._isRotating=!1,this.updateModel(),b.off("mouseup",this._mouseupHandler).off("mousemove",this._mousemoveHandler).off("keyup",this._keyupHandler)},rotateForDragDelta:function(b,c){this._previousRotationDragX=this._currentRotationDragX,this._previousRotationDragY=this._currentRotationDragY,this._currentRotationDragX=b,this._currentRotationDragY=c;var d=b-this._previousRotationDragX,e=c-this._previousRotationDragY,f=d+e,g=a.util.getRotation(this.$el),h=g+f;this.$el.css("transform","rotate("+h+"deg)")}});return d.generateHtml=function(a,b,d){return Mustache.render(c,{extraClass:a,position:b,percent:d})},d}),define("src/ui/crosshairs",["src/app","src/ui/crosshair"],function(a,b){return Backbone.View.extend({initialize:function(a){_.extend(this,a)},addCrosshairView:function(c){var d=a.collection.keyframes.length,e=d%2?$(b.generateHtml("from","from",c.get("percent"))):$(b.generateHtml("to","to",c.get("percent")));this.$el.append(e);var f=new b({$el:e,model:c})}})}),define("src/ui/background",["src/app"],function(a){return Backbone.View.extend({initialize:function(a){_.extend(this,a),this.context=this.$el[0].getContext("2d"),this.resize({height:a.height,width:a.width})},resize:function(a){_.each(["height","width"],function(b){if(b in a){var c={};c[b]=a[b],this.$el.css(c).attr(c)}},this)},generatePathPoints:function(b,c,d,e,f,g){var h=[],i={x:b,y:c},j={x:d,y:e},k={x:f,y:g},l,m;for(l=0;l<=a.constant.RENDER_GRANULARITY;l++)m=Tweenable.interpolate(i,j,1/a.constant.RENDER_GRANULARITY*l,k),h.push(m);return h},generatePathPrerender:function(b,c,d,e,f,g,h){a.config.prerenderedPath=document.createElement("canvas"),a.config.prerenderedPath.width=a.view.canvas.$canvasBG.width(),a.config.prerenderedPath.height=a.view.canvas.$canvasBG.height();var i=a.config.prerenderedPath.ctx=a.config.prerenderedPath.getContext("2d"),j=this.generatePathPoints.apply(this,arguments),k;i.beginPath(),_.each(j,function(a){k?i.lineTo(a.x,a.y):i.moveTo(a.x,a.y),k=a}),i.lineWidth=1;var l=h?"rgba(255,176,0,.5)":"rgb(255,176,0)";i.strokeStyle=l,i.stroke(),i.closePath()},update:function(b){var c=a.collection.keyframes.first().getAttrs(),d=a.collection.keyframes.last().getAttrs();this.generatePathPrerender(c.x,c.y,d.x,d.y,a.config.selects.x.$el.val(),a.config.selects.y.$el.val(),b),a.config.prerenderedPath&&(this.$el[0].width=this.$el.width(),a.config.isPathShowing&&this.context.drawImage(a.config.prerenderedPath,0,0))}})}),define("src/ui/canvas",["src/app","src/ui/background"],function(a,b){var c=$(window),d=$("header");return Backbone.View.extend({initialize:function(a){_.extend(this,a),this.initDOM()},initDOM:function(){var d=c.height(),e=c.width();this.backgroundView=new b({$el:this.$canvasBG,height:d,width:e});var f=this.getDOMActor();a.kapi.addActor(f),a.config.currentActor=f,this.setDOMKeyframePoints(f),c.on("resize",_.bind(this.onWindowResize,this))},onWindowResize:function(b){var e=c.height()-d.outerHeight(),f=c.width();a.kapi.canvas.height(e),a.kapi.canvas.width(f),this.backgroundView.resize({height:e,width:f}),this.backgroundView.update()},getDOMActor:function(){var a=$("#rekapi-canvas").children();return new Kapi.DOMActor(a[0])},setDOMKeyframePoints:function(b){b.keyframe(0,a.collection.keyframes.first().getCSS(),"linear linear").keyframe(+a.config.initialDuration,a.collection.keyframes.last().getCSS(),"linear linear")}})}),define("src/ui/pane",["src/app"],function(a){var b=$(window);return Backbone.View.extend({CONTAINER_TEMPLATE:['<div class="pane"></div>'].join(""),HANDLE_TEMPLATE:['<div class="pane-handle"></div>'].join(""),CONTENT_WRAPPER_TEMPLATE:['<div class="pane-content"></div>'].join(""),events:{},initialize:function(a){_.extend(this,a),this.$handle=$(this.HANDLE_TEMPLATE),this.$el.wrap($(this.CONTAINER_TEMPLATE)),this.$el=this.$el.parent(),this.$el.wrapInner($(this.CONTENT_WRAPPER_TEMPLATE)).prepend(this.$handle).css({left:b.width()-this.$el.outerWidth(!0)}).dragon({within:this.$el.parent(),handle:".pane-handle"}),this.oldSize=this.getSize(),b.on("resize",_.bind(this.onResize,this))},onResize:function(a){var c=this.$el.outerWidth(!0),d=b.width();this.$el.offset().left+c>d&&this.$el.css("left",d-c)},getSize:function(){return{height:this.$el.height(),width:this.$el.width()}},toggle:function(){this.$el.fadeToggle(a.constant.TOGGLE_FADE_SPEED)}})}),define("src/ui/tabs",[],function(){return Backbone.View.extend({ACTIVE_CLASS:"tabs-active",events:{"click .tabs li":"onTabClick"},initialize:function(a){_.extend(this,a),this.delegateEvents(),this.tabs=this.$el.find(".tabs").children(),this.contents=this.$el.find(".tabs-contents").children(),this.tabs.eq(0).trigger("click")},onTabClick:function(a){a.preventDefault();var b=$(a.currentTarget);this.tabs.removeClass(this.ACTIVE_CLASS),b.addClass(this.ACTIVE_CLASS),this.contents.css("display","none"),$("#"+b.data("target")).css("display","block")}})}),define("src/ui/css-output",["src/app"],function(a){function c(a){var c=[];return _.each(a.config.activeClasses,function(a,d){a&&c.push(b[d])}),c}var b={moz:"mozilla",ms:"microsoft",o:"opera",webkit:"webkit",w3:"w3"};return Backbone.View.extend({events:{},initialize:function(a){_.extend(this,a),this.$trigger.on("click",_.bind(this.onTriggerClick,this))},onTriggerClick:function(a){this.renderCSS()},renderCSS:function(){var b=a.kapi.toCSS({vendors:c(a),name:a.view.cssNameField.$el.val(),iterations:a.config.animationIteration.val(),isCentered:a.config.isCenteredToPath});this.$el.val(b)}})}),define("src/ui/html-input",["src/app"],function(a){return Backbone.View.extend({events:{keyup:"onKeyup"},initialize:function(a){_.extend(this,a),this.$renderTarget=$("#rekapi-canvas .rekapi-actor"),this.initialValue=this.readFromDOM(),this.$el.html(this.initialValue)},onKeyup:function(){this.renderToDOM()},readFromDOM:function(){return a.util.trimString(this.$renderTarget.html())},renderToDOM:function(){var a=this.$el.val()||this.initialValue;this.$renderTarget.html(a)}})}),define("src/ui/incrementer-field",["src/ui/auto-update-textfield"],function(a){return a.extend({increment:10,initialize:function(b){a.prototype.initialize.call(this,b)},tweakVal:function(a){this.$el.val(parseInt(this.$el.val(),10)+a),this.$el.trigger("keyup")},onArrowUp:function(){this.tweakVal(this.increment)},onArrowDown:function(){this.tweakVal(-this.increment)}})}),define("src/ui/keyframe-form",["src/app","src/ui/incrementer-field"],function(a,b){function c(c){return new b({$el:c,onValReenter:_.bind(function(b){this.model.set(c.data("keyframeattr"),+b),publish(a.constant.KEYFRAME_UPDATED),a.collection.keyframes.updateModelCrosshairViews(),a.kapi.update()},this)})}return Backbone.View.extend({events:{},KEYFRAME_TEMPLATE:['<li class="keyframe">',"<h3></h3>","<label>","<span>X:</span>",'<input class="quarter-width keyframe-attr-x" type="text" data-keyframeattr="x"></input>',"</label>","<label>","<span>Y:</span>",'<input class="quarter-width keyframe-attr-y" type="text" data-keyframeattr="y"></input>',"</label>","<label>","<span>R:</span>",'<input class="quarter-width keyframe-attr-r" type="text" data-keyframeattr="r"></input>',"</label>","</li>"].join(""),initialize:function(a){_.extend(this,a),this.$el=$(this.KEYFRAME_TEMPLATE),this.model.keyframeForm=this,this.initDOMReferences(),this.initIncrementers(),this.render()},initDOMReferences:function(){this.header=this.$el.find("h3"),this.inputX=this.$el.find(".keyframe-attr-x"),this.inputY=this.$el.find(".keyframe-attr-y"),this.inputR=this.$el.find(".keyframe-attr-r")},initIncrementers:function(){this.incrementerViews={},_.each([this.inputX,this.inputY,this.inputR],function(a){this.incrementerViews[a.data("keyframeattr")]=c.call(this,a)},this)},render:function(){this.header.html(this.model.get("percent")+"%"),this.model.get("x")!==parseFloat(this.inputX.val())&&this.inputX.val(this.model.get("x")),this.model.get("y")!==parseFloat(this.inputY.val())&&this.inputY.val(this.model.get("y")),this.model.get("r")!==parseFloat(this.inputR.val())&&this.inputR.val(this.model.get("r"))}})}),define("src/ui/keyframe-forms",["src/ui/keyframe-form"],function(a){return Backbone.View.extend({initialize:function(a){_.extend(this,a),this.keyframeForms={}},addKeyframeView:function(b){var c=new a({owner:this,model:b});this.keyframeForms[c.cid]=c,this.$el.append(c.$el)},render:function(){_.each(this.keyframeForms,function(a){a.render()})}})}),define("src/ui/modal",["src/app"],function(a){var b=$(window);return Backbone.View.extend({events:{},initialize:function(a){_.extend(this,a),this.$el.css("display","none").removeClass("hid"),this._windowKeyhandler=_.bind(this.onWindowKeydown,this),this._windowClickhandler=_.bind(this.onWindowClick,this),this.$triggerEl.on("click",_.bind(this.onTriggerClick,this))},onTriggerClick:function(a){this.toggle(),a.stopPropagation(),a.preventDefault()},onWindowKeydown:function(a){a.keyCode===27&&this.hide()},onWindowClick:function(a){!$.contains(this.$el[0],a.srcElement)&&this.$el[0]!==a.srcElement&&this.hide()},show:function(){this.$el.fadeIn(a.constant.TOGGLE_FADE_SPEED),b.on("keydown",this._windowKeyhandler).on("click",this._windowClickhandler)},hide:function(){this.$el.fadeOut(a.constant.TOGGLE_FADE_SPEED),b.off("keydown",this._windowKeyhandler).off("click",this._windowClickhandler)},toggle:function(){this.$el.is(":visible")?this.hide():this.show()}})}),define("src/ui/hotkey-handler",["src/app"],function(a){return Backbone.View.extend({events:{keydown:"onKeydown",keyup:"onKeyup"},initialize:function(a){_.extend(this,a)},onKeydown:function(b){if(b.target!==this.$el[0])return;b.shiftKey?this.$el.addClass("shift-down"):b.keyCode===67?a.view.controlPane.toggle():b.keyCode===72?a.view.helpModal.toggle():b.keyCode===32?a.kapi.isPlaying()?a.kapi.pause():a.kapi.play():b.keyCode===84&&a.view.rekapiControls.fadeToggle()},onKeyup:function(a){this.$el.removeClass("shift-down")}})}),define("src/ui/rekapi-controls",["src/app"],function(a){return Backbone.View.extend({initialize:function(b){_.extend(this,b),this.scrubber=new RekapiScrubber(a.kapi,a.view.canvas.$canvasBG[0]),this.$el=this.scrubber.$container},fadeToggle:function(){this.$el.fadeToggle(a.constant.TOGGLE_FADE_SPEED)}})}),define("src/model/keyframe",["src/app"],function(a){return Backbone.Model.extend({initialize:function(b,c){_.extend(this,c),subscribe(a.constant.KEYFRAME_UPDATED,_.bind(this.updateActor,this))},validate:function(a){var b=!1;_.each(a,function(a){typeof a!="number"&&(b=!0)});if(b)return"Number is NaN"},updateActor:function(b){a.view.canvas&&a.view.canvas.backgroundView.update();var c=this.get("percent")===0?0:a.config.animationDuration;a.config.currentActor&&(a.config.currentActor.modifyKeyframe(c,this.getCSS()),b||a.kapi.update())},getCSS:function(){return{transform:["translateX(",this.get("x"),"px) translateY(",this.get("y"),"px) rotate(",this.get("r"),a.config.isCenteredToPath?"deg) translate(-50%, -50%)":"deg)"].join("")}},getAttrs:function(){return{x:this.get("x"),y:this.get("y"),r:this.get("r")}}})}),define("src/ui/keyframe",["src/app"],function(a){return Backbone.View.extend({initialize:function(b){_.extend(this,b),a.view.crosshairs.addCrosshairView(this.model),a.view.keyframeForms.addKeyframeView(this.model)}})}),define("src/collection/keyframes",["src/app","src/model/keyframe","src/ui/keyframe"],function(a,b,c){return Backbone.Collection.extend({model:b,initialize:function(a,b){this.on("add",function(a){new c({model:a})})},updateModelKeyframeViews:function(){if(!this.models[0].keyframeForm)return;_.each(this.models,function(a){a.keyframeForm.render()})},updateModelCrosshairViews:function(){if(!this.models[0].crosshairView)return;_.each(this.models,function(a){a.crosshairView.render()})}})}),require(["src/app","src/utils","src/ui/checkbox","src/ui/select","src/ui/auto-update-textfield","src/ui/ease-field","src/ui/crosshairs","src/ui/canvas","src/ui/pane","src/ui/tabs","src/ui/css-output","src/ui/html-input","src/ui/keyframe-forms","src/ui/incrementer-field","src/ui/modal","src/ui/hotkey-handler","src/ui/rekapi-controls","src/collection/keyframes"],function(app,utils,CheckboxView,SelectView,AutoUpdateTextFieldView,EaseFieldView,CrosshairsView,CanvasView,PaneView,TabsView,CSSOutputView,HTMLInputView,KeyframeFormsView,IncrementerFieldView,ModalView,HotkeyHandlerView,RekapiControlsView,KeyframeCollection){var $win=$(window);_.extend(app.constant,{PRERENDER_GRANULARITY:150,RENDER_GRANULARITY:100,KEYFRAME_UPDATED:"keyframeUpdated",UPDATE_CSS_OUTPUT:"updateCSSOutput",TOGGLE_FADE_SPEED:200,INITIAL_KEYFRAMES:2}),app.config.activeClasses.moz=!1,app.config.activeClasses.ms=!1,app.config.activeClasses.o=!1,app.config.activeClasses.webkit=!1,app.config.activeClasses.w3=!0,utils.init(app),app.constant.QUERY_STRING=app.util.getQueryParams();var customEase1FnString=["Tweenable.prototype.formula.customEase1 = ","function (x) {return Math.pow(x, 4);}"].join("");eval(customEase1FnString);var customEase2FnString=["Tweenable.prototype.formula.customEase2 = ","function (x) {return Math.pow(x, 0.25);}"].join("");eval(customEase2FnString),app.kapi=new Kapi({context:document.getElementById("rekapi-canvas"),height:$win.height(),width:$win.width()}),app.config.selects={x:new SelectView({$el:$("#x-easing")}),y:new SelectView({$el:$("#y-easing")}),r:new SelectView({$el:$("#r-easing")})},app.view.hotkeyHandler=new HotkeyHandlerView({$el:$(document.body)}),app.view.helpModal=new ModalView({$el:$("#help-contents"),$triggerEl:$("#help-trigger")}),app.view.durationField=new IncrementerFieldView({$el:$("#duration"),onValReenter:function(a){if(!isNaN(a)){var b=Math.abs(a);app.util.moveLastKeyframe(app.config.currentActor,b)}}}),app.config.animationDuration=app.config.initialDuration=+app.view.durationField.$el.val(),app.config.animationIteration=$("#iterations"),app.config.easeFields=[],$(".ease").each(function(a,b){var c=new EaseFieldView({$el:$(b)});app.config.easeFields.push(c)});var halfCrossHairHeight=$("#crosshairs .crosshair:first").height()/2,crosshairStartingY=$win.height()/2-halfCrossHairHeight;app.view.keyframeForms=new KeyframeFormsView({$el:$("#keyframe-controls .controls")}),app.view.crosshairs=new CrosshairsView({$el:$("#crosshairs")}),app.collection.keyframes=new KeyframeCollection;var winWidth=$win.width();_.each([0,100],function(a,b){app.collection.keyframes.add({x:b?winWidth-winWidth/(b+1):40,y:crosshairStartingY,r:0,percent:a})}),app.view.canvas=new CanvasView({$el:$("#rekapi-canvas"),$canvasBG:$("#tween-path")}),app.view.rekapiControls=new RekapiControlsView,app.view.canvas.backgroundView.update(),app.constant.QUERY_STRING.debug||app.kapi.play(),app.view.showPath=new CheckboxView({$el:$("#show-path"),callHandlerOnInit:!0,onChange:function(a,b){app.config.isPathShowing=!!b,app.kapi.update(),app.view.canvas.backgroundView.update()}}),app.view.controlPane=new PaneView({$el:$("#control-pane")}),app.view.controlPaneTabs=new TabsView({$el:$("#control-pane")}),app.view.cssOutput=new CSSOutputView({$el:$("#css-output textarea"),$trigger:app.view.controlPaneTabs.$el.find('[data-target="css-output"]')}),subscribe(app.constant.UPDATE_CSS_OUTPUT,function(){app.view.cssOutput.renderCSS()}),app.view.cssNameField=new AutoUpdateTextFieldView({$el:$("#css-name"),onKeyup:function(a){app.config.className=a,publish(app.constant.UPDATE_CSS_OUTPUT)}}),app.view.mozCheckbox=new CheckboxView({$el:$("#moz-toggle"),onChange:function(a,b){app.config.activeClasses.moz=b,publish(app.constant.UPDATE_CSS_OUTPUT)}}),app.view.msCheckbox=new CheckboxView({$el:$("#ms-toggle"),onChange:function(a,b){app.config.activeClasses.ms=b,publish(app.constant.UPDATE_CSS_OUTPUT)}}),app.view.oCheckbox=new CheckboxView({$el:$("#o-toggle"),onChange:function(a,b){app.config.activeClasses.o=b,publish(app.constant.UPDATE_CSS_OUTPUT)}}),app.view.webkitCheckbox=new CheckboxView({$el:$("#webkit-toggle"),onChange:function(a,b){app.config.activeClasses.webkit=b,publish(app.constant.UPDATE_CSS_OUTPUT)}}),app.view.w3Checkbox=new CheckboxView({$el:$("#w3-toggle"),onChange:function(a,b){app.config.activeClasses.w3=b,publish(app.constant.UPDATE_CSS_OUTPUT)}}),app.view.htmlInput=new HTMLInputView({$el:$("#html-input textarea")}),app.view.centerToPathCheckbox=new CheckboxView({$el:$("#center-to-path"),callHandlerOnInit:!0,onChange:function(a,b){app.config.isCenteredToPath=!!b;var c=app.config.isCenteredToPath?"0 0":"";app.view.htmlInput.$renderTarget.css("transform-origin",c),publish(app.constant.KEYFRAME_UPDATED,[!0]),app.kapi.update()}}),$(window).trigger("resize"),app.constant.QUERY_STRING.debug&&(window.app=app)}),define("src/init",function(){})