'use strict';"use strict";
var core_1 = require('angular2/core');
var constants_1 = require('./constants');
var util_1 = require('./util');
var angular = require('./angular_js');
var CAMEL_CASE = /([A-Z])/g;
var INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var NOT_SUPPORTED = 'NOT_SUPPORTED';
var UpgradeNg1ComponentAdapterBuilder = (function () {
    function UpgradeNg1ComponentAdapterBuilder(name) {
        this.name = name;
        this.inputs = [];
        this.inputsRename = [];
        this.outputs = [];
        this.outputsRename = [];
        this.propertyOutputs = [];
        this.checkProperties = [];
        this.propertyMap = {};
        this.linkFn = null;
        this.directive = null;
        this.$controller = null;
        var selector = name.replace(CAMEL_CASE, function (all, next) { return '-' + next.toLowerCase(); });
        var self = this;
        this.type =
            core_1.Directive({ selector: selector, inputs: this.inputsRename, outputs: this.outputsRename })
                .Class({
                constructor: [
                    new core_1.Inject(constants_1.NG1_SCOPE),
                    core_1.ElementRef,
                    function (scope, elementRef) {
                        return new UpgradeNg1ComponentAdapter(self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                    }
                ],
                ngOnInit: function () { },
                ngOnChanges: function () { },
                ngDoCheck: function () { }
            });
    }
    UpgradeNg1ComponentAdapterBuilder.prototype.extractDirective = function (injector) {
        var directives = injector.get(this.name + 'Directive');
        if (directives.length > 1) {
            throw new Error('Only support single directive definition for: ' + this.name);
        }
        var directive = directives[0];
        if (directive.replace)
            this.notSupported('replace');
        if (directive.terminal)
            this.notSupported('terminal');
        var link = directive.link;
        if (typeof link == 'object') {
            if (link.post)
                this.notSupported('link.post');
        }
        return directive;
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.notSupported = function (feature) {
        throw new Error("Upgraded directive '" + this.name + "' does not support '" + feature + "'.");
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function () {
        var btcIsObject = typeof this.directive.bindToController === 'object';
        if (btcIsObject && Object.keys(this.directive.scope).length) {
            throw new Error("Binding definitions on scope and controller at the same time are not supported.");
        }
        var context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
        if (typeof context == 'object') {
            for (var name in context) {
                if (context.hasOwnProperty(name)) {
                    var localName = context[name];
                    var type = localName.charAt(0);
                    localName = localName.substr(1) || name;
                    var outputName = 'output_' + name;
                    var outputNameRename = outputName + ': ' + name;
                    var outputNameRenameChange = outputName + ': ' + name + 'Change';
                    var inputName = 'input_' + name;
                    var inputNameRename = inputName + ': ' + name;
                    switch (type) {
                        case '=':
                            this.propertyOutputs.push(outputName);
                            this.checkProperties.push(localName);
                            this.outputs.push(outputName);
                            this.outputsRename.push(outputNameRenameChange);
                            this.propertyMap[outputName] = localName;
                        // don't break; let it fall through to '@'
                        case '@':
                        // handle the '<' binding of angular 1.5 components
                        case '<':
                            this.inputs.push(inputName);
                            this.inputsRename.push(inputNameRename);
                            this.propertyMap[inputName] = localName;
                            break;
                        case '&':
                            this.outputs.push(outputName);
                            this.outputsRename.push(outputNameRename);
                            this.propertyMap[outputName] = localName;
                            break;
                        default:
                            var json = JSON.stringify(context);
                            throw new Error("Unexpected mapping '" + type + "' in '" + json + "' in '" + this.name + "' directive.");
                    }
                }
            }
        }
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.compileTemplate = function (compile, templateCache, httpBackend) {
        var _this = this;
        if (this.directive.template !== undefined) {
            this.linkFn = compileHtml(this.directive.template);
        }
        else if (this.directive.templateUrl) {
            var url = this.directive.templateUrl;
            var html = templateCache.get(url);
            if (html !== undefined) {
                this.linkFn = compileHtml(html);
            }
            else {
                return new Promise(function (resolve, err) {
                    httpBackend('GET', url, null, function (status, response) {
                        if (status == 200) {
                            resolve(_this.linkFn = compileHtml(templateCache.put(url, response)));
                        }
                        else {
                            err("GET " + url + " returned " + status + ": " + response);
                        }
                    });
                });
            }
        }
        else {
            throw new Error("Directive '" + this.name + "' is not a component, it is missing template.");
        }
        return null;
        function compileHtml(html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            return compile(div.childNodes);
        }
    };
    UpgradeNg1ComponentAdapterBuilder.resolve = function (exportedComponents, injector) {
        var promises = [];
        var compile = injector.get(constants_1.NG1_COMPILE);
        var templateCache = injector.get(constants_1.NG1_TEMPLATE_CACHE);
        var httpBackend = injector.get(constants_1.NG1_HTTP_BACKEND);
        var $controller = injector.get(constants_1.NG1_CONTROLLER);
        for (var name in exportedComponents) {
            if (exportedComponents.hasOwnProperty(name)) {
                var exportedComponent = exportedComponents[name];
                exportedComponent.directive = exportedComponent.extractDirective(injector);
                exportedComponent.$controller = $controller;
                exportedComponent.extractBindings();
                var promise = exportedComponent.compileTemplate(compile, templateCache, httpBackend);
                if (promise)
                    promises.push(promise);
            }
        }
        return Promise.all(promises);
    };
    return UpgradeNg1ComponentAdapterBuilder;
}());
exports.UpgradeNg1ComponentAdapterBuilder = UpgradeNg1ComponentAdapterBuilder;
var UpgradeNg1ComponentAdapter = (function () {
    function UpgradeNg1ComponentAdapter(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
        this.linkFn = linkFn;
        this.directive = directive;
        this.inputs = inputs;
        this.outputs = outputs;
        this.propOuts = propOuts;
        this.checkProperties = checkProperties;
        this.propertyMap = propertyMap;
        this.destinationObj = null;
        this.checkLastValues = [];
        this.element = elementRef.nativeElement;
        this.componentScope = scope.$new(!!directive.scope);
        var $element = angular.element(this.element);
        var controllerType = directive.controller;
        var controller = null;
        if (controllerType) {
            var locals = { $scope: this.componentScope, $element: $element };
            controller = $controller(controllerType, locals, null, directive.controllerAs);
            $element.data(util_1.controllerKey(directive.name), controller);
        }
        var link = directive.link;
        if (typeof link == 'object')
            link = link.pre;
        if (link) {
            var attrs = NOT_SUPPORTED;
            var transcludeFn = NOT_SUPPORTED;
            var linkController = this.resolveRequired($element, directive.require);
            directive.link(this.componentScope, $element, attrs, linkController, transcludeFn);
        }
        this.destinationObj =
            directive.bindToController && controller ? controller : this.componentScope;
        for (var i = 0; i < inputs.length; i++) {
            this[inputs[i]] = null;
        }
        for (var j = 0; j < outputs.length; j++) {
            var emitter = this[outputs[j]] = new core_1.EventEmitter();
            this.setComponentProperty(outputs[j], (function (emitter) { return function (value) { return emitter.emit(value); }; })(emitter));
        }
        for (var k = 0; k < propOuts.length; k++) {
            this[propOuts[k]] = new core_1.EventEmitter();
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    UpgradeNg1ComponentAdapter.prototype.ngOnInit = function () {
        var _this = this;
        var childNodes = [];
        var childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        this.linkFn(this.componentScope, function (clonedElement, scope) {
            for (var i = 0, ii = clonedElement.length; i < ii; i++) {
                _this.element.appendChild(clonedElement[i]);
            }
        }, { parentBoundTranscludeFn: function (scope, cloneAttach) { cloneAttach(childNodes); } });
        if (this.destinationObj.$onInit) {
            this.destinationObj.$onInit();
        }
    };
    UpgradeNg1ComponentAdapter.prototype.ngOnChanges = function (changes) {
        for (var name in changes) {
            if (changes.hasOwnProperty(name)) {
                var change = changes[name];
                this.setComponentProperty(name, change.currentValue);
            }
        }
    };
    UpgradeNg1ComponentAdapter.prototype.ngDoCheck = function () {
        var count = 0;
        var destinationObj = this.destinationObj;
        var lastValues = this.checkLastValues;
        var checkProperties = this.checkProperties;
        for (var i = 0; i < checkProperties.length; i++) {
            var value = destinationObj[checkProperties[i]];
            var last = lastValues[i];
            if (value !== last) {
                if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
                }
                else {
                    var eventEmitter = this[this.propOuts[i]];
                    eventEmitter.emit(lastValues[i] = value);
                }
            }
        }
        return count;
    };
    UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
        this.destinationObj[this.propertyMap[name]] = value;
    };
    UpgradeNg1ComponentAdapter.prototype.resolveRequired = function ($element, require) {
        if (!require) {
            return undefined;
        }
        else if (typeof require == 'string') {
            var name = require;
            var isOptional = false;
            var startParent = false;
            var searchParents = false;
            var ch;
            if (name.charAt(0) == '?') {
                isOptional = true;
                name = name.substr(1);
            }
            if (name.charAt(0) == '^') {
                searchParents = true;
                name = name.substr(1);
            }
            if (name.charAt(0) == '^') {
                startParent = true;
                name = name.substr(1);
            }
            var key = util_1.controllerKey(name);
            if (startParent)
                $element = $element.parent();
            var dep = searchParents ? $element.inheritedData(key) : $element.data(key);
            if (!dep && !isOptional) {
                throw new Error("Can not locate '" + require + "' in '" + this.directive.name + "'.");
            }
            return dep;
        }
        else if (require instanceof Array) {
            var deps = [];
            for (var i = 0; i < require.length; i++) {
                deps.push(this.resolveRequired($element, require[i]));
            }
            return deps;
        }
        throw new Error("Directive '" + this.directive.name + "' require syntax unrecognized: " + this.directive.require);
    };
    return UpgradeNg1ComponentAdapter;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSWZMTUFDaDgudG1wL2FuZ3VsYXIyL3NyYy91cGdyYWRlL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQVVPLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZCLDBCQU1PLGFBQWEsQ0FBQyxDQUFBO0FBQ3JCLHFCQUE0QixRQUFRLENBQUMsQ0FBQTtBQUNyQyxJQUFZLE9BQU8sV0FBTSxjQUFjLENBQUMsQ0FBQTtBQUV4QyxJQUFNLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDOUIsSUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBQ0YsSUFBTSxhQUFhLEdBQVEsZUFBZSxDQUFDO0FBRzNDO0lBYUUsMkNBQW1CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBWC9CLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFDdEIsaUJBQVksR0FBYSxFQUFFLENBQUM7UUFDNUIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixrQkFBYSxHQUFhLEVBQUUsQ0FBQztRQUM3QixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMvQixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMvQixnQkFBVyxHQUE2QixFQUFFLENBQUM7UUFDM0MsV0FBTSxHQUFvQixJQUFJLENBQUM7UUFDL0IsY0FBUyxHQUF1QixJQUFJLENBQUM7UUFDckMsZ0JBQVcsR0FBK0IsSUFBSSxDQUFDO1FBRzdDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQUMsR0FBRyxFQUFFLElBQVksSUFBSyxPQUFBLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQXhCLENBQXdCLENBQUMsQ0FBQztRQUN6RixJQUFJLElBQUksR0FBRyxJQUFJ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QUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDcEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RCxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUNYLGdCQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx1Q0FBa0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFTLENBQUMsQ0FBQztJQUNuRyxDQUFDO0lBQ0gsaUNBQUM7QUFBRCxDQUFDLEFBdklELElBdUlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBEb0NoZWNrLFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdCxcbiAgT25Jbml0LFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZSxcbiAgVHlwZVxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7XG4gIE5HMV9DT01QSUxFLFxuICBORzFfU0NPUEUsXG4gIE5HMV9IVFRQX0JBQ0tFTkQsXG4gIE5HMV9URU1QTEFURV9DQUNIRSxcbiAgTkcxX0NPTlRST0xMRVJcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjb250cm9sbGVyS2V5fSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXJfanMnO1xuXG5jb25zdCBDQU1FTF9DQVNFID0gLyhbQS1aXSkvZztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuXG5cbmV4cG9ydCBjbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIge1xuICB0eXBlOiBUeXBlO1xuICBpbnB1dHM6IHN0cmluZ1tdID0gW107XG4gIGlucHV0c1JlbmFtZTogc3RyaW5nW10gPSBbXTtcbiAgb3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgb3V0cHV0c1JlbmFtZTogc3RyaW5nW10gPSBbXTtcbiAgcHJvcGVydHlPdXRwdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBjaGVja1Byb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5TWFwOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgbGlua0ZuOiBhbmd1bGFyLklMaW5rRm4gPSBudWxsO1xuICBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZSA9IG51bGw7XG4gICRjb250cm9sbGVyOiBhbmd1bGFyLklDb250cm9sbGVyU2VydmljZSA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZykge1xuICAgIHZhciBzZWxlY3RvciA9IG5hbWUucmVwbGFjZShDQU1FTF9DQVNFLCAoYWxsLCBuZXh0OiBzdHJpbmcpID0+ICctJyArIG5leHQudG9Mb3dlckNhc2UoKSk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMudHlwZSA9XG4gICAgICAgIERpcmVjdGl2ZSh7c2VsZWN0b3I6IHNlbGVjdG9yLCBpbnB1dHM6IHRoaXMuaW5wdXRzUmVuYW1lLCBvdXRwdXRzOiB0aGlzLm91dHB1dHNSZW5hbWV9KVxuICAgICAgICAgICAgLkNsYXNzKHtcbiAgICAgICAgICAgICAgY29uc3RydWN0b3I6IFtcbiAgICAgICAgICAgICAgICBuZXcgSW5qZWN0KE5HMV9TQ09QRSksXG4gICAgICAgICAgICAgICAgRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgc2VsZi5saW5rRm4sIHNjb3BlLCBzZWxmLmRpcmVjdGl2ZSwgZWxlbWVudFJlZiwgc2VsZi4kY29udHJvbGxlciwgc2VsZi5pbnB1dHMsXG4gICAgICAgICAgICAgICAgICAgICAgc2VsZi5vdXRwdXRzLCBzZWxmLnByb3BlcnR5T3V0cHV0cywgc2VsZi5jaGVja1Byb3BlcnRpZXMsIHNlbGYucHJvcGVydHlNYXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgbmdPbkluaXQ6IGZ1bmN0aW9uKCkgeyAvKiBuZWVkcyB0byBiZSBoZXJlIGZvciBuZzIgdG8gcHJvcGVybHkgZGV0ZWN0IGl0ICovIH0sXG4gICAgICAgICAgICAgIG5nT25DaGFuZ2VzOiBmdW5jdGlvbigpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqLyB9LFxuICAgICAgICAgICAgICBuZ0RvQ2hlY2s6IGZ1bmN0aW9uKCkgeyAvKiBuZWVkcyB0byBiZSBoZXJlIGZvciBuZzIgdG8gcHJvcGVybHkgZGV0ZWN0IGl0ICovIH1cbiAgICAgICAgICAgIH0pO1xuICB9XG5cbiAgZXh0cmFjdERpcmVjdGl2ZShpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKTogYW5ndWxhci5JRGlyZWN0aXZlIHtcbiAgICB2YXIgZGlyZWN0aXZlczogYW5ndWxhci5JRGlyZWN0aXZlW10gPSBpbmplY3Rvci5nZXQodGhpcy5uYW1lICsgJ0RpcmVjdGl2ZScpO1xuICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignT25seSBzdXBwb3J0IHNpbmdsZSBkaXJlY3RpdmUgZGVmaW5pdGlvbiBmb3I6ICcgKyB0aGlzLm5hbWUpO1xuICAgIH1cbiAgICB2YXIgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1swXTtcbiAgICBpZiAoZGlyZWN0aXZlLnJlcGxhY2UpIHRoaXMubm90U3VwcG9ydGVkKCdyZXBsYWNlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZS50ZXJtaW5hbCkgdGhpcy5ub3RTdXBwb3J0ZWQoJ3Rlcm1pbmFsJyk7XG4gICAgdmFyIGxpbmsgPSBkaXJlY3RpdmUubGluaztcbiAgICBpZiAodHlwZW9mIGxpbmsgPT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICgoPGFuZ3VsYXIuSURpcmVjdGl2ZVByZVBvc3Q+bGluaykucG9zdCkgdGhpcy5ub3RTdXBwb3J0ZWQoJ2xpbmsucG9zdCcpO1xuICAgIH1cbiAgICByZXR1cm4gZGlyZWN0aXZlO1xuICB9XG5cbiAgcHJpdmF0ZSBub3RTdXBwb3J0ZWQoZmVhdHVyZTogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVcGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5uYW1lfScgZG9lcyBub3Qgc3VwcG9ydCAnJHtmZWF0dXJlfScuYCk7XG4gIH1cblxuICBleHRyYWN0QmluZGluZ3MoKSB7XG4gICAgdmFyIGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgPT09ICdvYmplY3QnO1xuICAgIGlmIChidGNJc09iamVjdCAmJiBPYmplY3Qua2V5cyh0aGlzLmRpcmVjdGl2ZS5zY29wZSkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEJpbmRpbmcgZGVmaW5pdGlvbnMgb24gc2NvcGUgYW5kIGNvbnRyb2xsZXIgYXQgdGhlIHNhbWUgdGltZSBhcmUgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICB2YXIgY29udGV4dCA9IChidGNJc09iamVjdCkgPyB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyIDogdGhpcy5kaXJlY3RpdmUuc2NvcGU7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgPT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gY29udGV4dCkge1xuICAgICAgICBpZiAoKDxhbnk+Y29udGV4dCkuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICB2YXIgbG9jYWxOYW1lID0gY29udGV4dFtuYW1lXTtcbiAgICAgICAgICB2YXIgdHlwZSA9IGxvY2FsTmFtZS5jaGFyQXQoMCk7XG4gICAgICAgICAgbG9jYWxOYW1lID0gbG9jYWxOYW1lLnN1YnN0cigxKSB8fCBuYW1lO1xuICAgICAgICAgIHZhciBvdXRwdXROYW1lID0gJ291dHB1dF8nICsgbmFtZTtcbiAgICAgICAgICB2YXIgb3V0cHV0TmFtZVJlbmFtZSA9IG91dHB1dE5hbWUgKyAnOiAnICsgbmFtZTtcbiAgICAgICAgICB2YXIgb3V0cHV0TmFtZVJlbmFtZUNoYW5nZSA9IG91dHB1dE5hbWUgKyAnOiAnICsgbmFtZSArICdDaGFuZ2UnO1xuICAgICAgICAgIHZhciBpbnB1dE5hbWUgPSAnaW5wdXRfJyArIG5hbWU7XG4gICAgICAgICAgdmFyIGlucHV0TmFtZVJlbmFtZSA9IGlucHV0TmFtZSArICc6ICcgKyBuYW1lO1xuICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICAgIHRoaXMucHJvcGVydHlPdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICAgIHRoaXMuY2hlY2tQcm9wZXJ0aWVzLnB1c2gobG9jYWxOYW1lKTtcbiAgICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWVDaGFuZ2UpO1xuICAgICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW291dHB1dE5hbWVdID0gbG9jYWxOYW1lO1xuICAgICAgICAgICAgLy8gZG9uJ3QgYnJlYWs7IGxldCBpdCBmYWxsIHRocm91Z2ggdG8gJ0AnXG4gICAgICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgICAgIC8vIGhhbmRsZSB0aGUgJzwnIGJpbmRpbmcgb2YgYW5ndWxhciAxLjUgY29tcG9uZW50c1xuICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgICAgdGhpcy5pbnB1dHNSZW5hbWUucHVzaChpbnB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBsb2NhbE5hbWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IGxvY2FsTmFtZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke3R5cGV9JyBpbiAnJHtqc29ufScgaW4gJyR7dGhpcy5uYW1lfScgZGlyZWN0aXZlLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbXBpbGVUZW1wbGF0ZShjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSwgdGVtcGxhdGVDYWNoZTogYW5ndWxhci5JVGVtcGxhdGVDYWNoZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICBodHRwQmFja2VuZDogYW5ndWxhci5JSHR0cEJhY2tlbmRTZXJ2aWNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAodGhpcy5kaXJlY3RpdmUudGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5saW5rRm4gPSBjb21waWxlSHRtbCh0aGlzLmRpcmVjdGl2ZS50ZW1wbGF0ZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmRpcmVjdGl2ZS50ZW1wbGF0ZVVybCkge1xuICAgICAgdmFyIHVybCA9IHRoaXMuZGlyZWN0aXZlLnRlbXBsYXRlVXJsO1xuICAgICAgdmFyIGh0bWwgPSB0ZW1wbGF0ZUNhY2hlLmdldCh1cmwpO1xuICAgICAgaWYgKGh0bWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmxpbmtGbiA9IGNvbXBpbGVIdG1sKGh0bWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCBlcnIpID0+IHtcbiAgICAgICAgICBodHRwQmFja2VuZCgnR0VUJywgdXJsLCBudWxsLCAoc3RhdHVzLCByZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLmxpbmtGbiA9IGNvbXBpbGVIdG1sKHRlbXBsYXRlQ2FjaGUucHV0KHVybCwgcmVzcG9uc2UpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlcnIoYEdFVCAke3VybH0gcmV0dXJuZWQgJHtzdGF0dXN9OiAke3Jlc3BvbnNlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaXJlY3RpdmUgJyR7dGhpcy5uYW1lfScgaXMgbm90IGEgY29tcG9uZW50LCBpdCBpcyBtaXNzaW5nIHRlbXBsYXRlLmApO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgICBmdW5jdGlvbiBjb21waWxlSHRtbChodG1sKTogYW5ndWxhci5JTGlua0ZuIHtcbiAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgcmV0dXJuIGNvbXBpbGUoZGl2LmNoaWxkTm9kZXMpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyByZXNvbHZlKGV4cG9ydGVkQ29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9LFxuICAgICAgICAgICAgICAgICBpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICB2YXIgY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UgPSBpbmplY3Rvci5nZXQoTkcxX0NPTVBJTEUpO1xuICAgIHZhciB0ZW1wbGF0ZUNhY2hlOiBhbmd1bGFyLklUZW1wbGF0ZUNhY2hlU2VydmljZSA9IGluamVjdG9yLmdldChORzFfVEVNUExBVEVfQ0FDSEUpO1xuICAgIHZhciBodHRwQmFja2VuZDogYW5ndWxhci5JSHR0cEJhY2tlbmRTZXJ2aWNlID0gaW5qZWN0b3IuZ2V0KE5HMV9IVFRQX0JBQ0tFTkQpO1xuICAgIHZhciAkY29udHJvbGxlcjogYW5ndWxhci5JQ29udHJvbGxlclNlcnZpY2UgPSBpbmplY3Rvci5nZXQoTkcxX0NPTlRST0xMRVIpO1xuICAgIGZvciAodmFyIG5hbWUgaW4gZXhwb3J0ZWRDb21wb25lbnRzKSB7XG4gICAgICBpZiAoKDxhbnk+ZXhwb3J0ZWRDb21wb25lbnRzKS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICB2YXIgZXhwb3J0ZWRDb21wb25lbnQgPSBleHBvcnRlZENvbXBvbmVudHNbbmFtZV07XG4gICAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmRpcmVjdGl2ZSA9IGV4cG9ydGVkQ29tcG9uZW50LmV4dHJhY3REaXJlY3RpdmUoaW5qZWN0b3IpO1xuICAgICAgICBleHBvcnRlZENvbXBvbmVudC4kY29udHJvbGxlciA9ICRjb250cm9sbGVyO1xuICAgICAgICBleHBvcnRlZENvbXBvbmVudC5leHRyYWN0QmluZGluZ3MoKTtcbiAgICAgICAgdmFyIHByb21pc2UgPSBleHBvcnRlZENvbXBvbmVudC5jb21waWxlVGVtcGxhdGUoY29tcGlsZSwgdGVtcGxhdGVDYWNoZSwgaHR0cEJhY2tlbmQpO1xuICAgICAgICBpZiAocHJvbWlzZSkgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxufVxuXG5jbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlciBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrIHtcbiAgZGVzdGluYXRpb25PYmo6IGFueSA9IG51bGw7XG4gIGNoZWNrTGFzdFZhbHVlczogYW55W10gPSBbXTtcbiAgY29tcG9uZW50U2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xuICBlbGVtZW50OiBFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbGlua0ZuOiBhbmd1bGFyLklMaW5rRm4sIHNjb3BlOiBhbmd1bGFyLklTY29wZSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZSwgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgICAgICAgJGNvbnRyb2xsZXI6IGFuZ3VsYXIuSUNvbnRyb2xsZXJTZXJ2aWNlLCBwcml2YXRlIGlucHV0czogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHByaXZhdGUgb3V0cHV0czogc3RyaW5nW10sIHByaXZhdGUgcHJvcE91dHM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwcml2YXRlIGNoZWNrUHJvcGVydGllczogc3RyaW5nW10sIHByaXZhdGUgcHJvcGVydHlNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCEhZGlyZWN0aXZlLnNjb3BlKTtcbiAgICB2YXIgJGVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy5lbGVtZW50KTtcbiAgICB2YXIgY29udHJvbGxlclR5cGUgPSBkaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICB2YXIgY29udHJvbGxlcjogYW55ID0gbnVsbDtcbiAgICBpZiAoY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHZhciBsb2NhbHMgPSB7JHNjb3BlOiB0aGlzLmNvbXBvbmVudFNjb3BlLCAkZWxlbWVudDogJGVsZW1lbnR9O1xuICAgICAgY29udHJvbGxlciA9ICRjb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCBsb2NhbHMsIG51bGwsIGRpcmVjdGl2ZS5jb250cm9sbGVyQXMpO1xuICAgICAgJGVsZW1lbnQuZGF0YShjb250cm9sbGVyS2V5KGRpcmVjdGl2ZS5uYW1lKSwgY29udHJvbGxlcik7XG4gICAgfVxuICAgIHZhciBsaW5rID0gZGlyZWN0aXZlLmxpbms7XG4gICAgaWYgKHR5cGVvZiBsaW5rID09ICdvYmplY3QnKSBsaW5rID0gKDxhbmd1bGFyLklEaXJlY3RpdmVQcmVQb3N0PmxpbmspLnByZTtcbiAgICBpZiAobGluaykge1xuICAgICAgdmFyIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICAgIHZhciB0cmFuc2NsdWRlRm46IGFuZ3VsYXIuSVRyYW5zY2x1ZGVGdW5jdGlvbiA9IE5PVF9TVVBQT1JURUQ7XG4gICAgICB2YXIgbGlua0NvbnRyb2xsZXIgPSB0aGlzLnJlc29sdmVSZXF1aXJlZCgkZWxlbWVudCwgZGlyZWN0aXZlLnJlcXVpcmUpO1xuICAgICAgKDxhbmd1bGFyLklEaXJlY3RpdmVMaW5rRm4+ZGlyZWN0aXZlLmxpbmspKHRoaXMuY29tcG9uZW50U2NvcGUsICRlbGVtZW50LCBhdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rQ29udHJvbGxlciwgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG4gICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9XG4gICAgICAgIGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyICYmIGNvbnRyb2xsZXIgPyBjb250cm9sbGVyIDogdGhpcy5jb21wb25lbnRTY29wZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzW2lucHV0c1tpXV0gPSBudWxsO1xuICAgIH1cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG91dHB1dHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBlbWl0dGVyID0gdGhpc1tvdXRwdXRzW2pdXSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkob3V0cHV0c1tqXSwgKChlbWl0dGVyKSA9PiAodmFsdWUpID0+IGVtaXR0ZXIuZW1pdCh2YWx1ZSkpKGVtaXR0ZXIpKTtcbiAgICB9XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBwcm9wT3V0cy5sZW5ndGg7IGsrKykge1xuICAgICAgdGhpc1twcm9wT3V0c1trXV0gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICB0aGlzLmNoZWNrTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHZhciBjaGlsZE5vZGVzOiBOb2RlW10gPSBbXTtcbiAgICB2YXIgY2hpbGROb2RlO1xuICAgIHdoaWxlIChjaGlsZE5vZGUgPSB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZSk7XG4gICAgICBjaGlsZE5vZGVzLnB1c2goY2hpbGROb2RlKTtcbiAgICB9XG4gICAgdGhpcy5saW5rRm4odGhpcy5jb21wb25lbnRTY29wZSwgKGNsb25lZEVsZW1lbnQ6IE5vZGVbXSwgc2NvcGU6IGFuZ3VsYXIuSVNjb3BlKSA9PiB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBjbG9uZWRFbGVtZW50Lmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGNsb25lZEVsZW1lbnRbaV0pO1xuICAgICAgfVxuICAgIH0sIHtwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbjogKHNjb3BlLCBjbG9uZUF0dGFjaCkgPT4geyBjbG9uZUF0dGFjaChjaGlsZE5vZGVzKTsgfX0pO1xuICAgIGlmICh0aGlzLmRlc3RpbmF0aW9uT2JqLiRvbkluaXQpIHtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmouJG9uSW5pdCgpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IHtbbmFtZTogc3RyaW5nXTogU2ltcGxlQ2hhbmdlfSkge1xuICAgIGZvciAodmFyIG5hbWUgaW4gY2hhbmdlcykge1xuICAgICAgaWYgKCg8T2JqZWN0PmNoYW5nZXMpLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIHZhciBjaGFuZ2U6IFNpbXBsZUNoYW5nZSA9IGNoYW5nZXNbbmFtZV07XG4gICAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkobmFtZSwgY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCk6IG51bWJlciB7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB2YXIgZGVzdGluYXRpb25PYmogPSB0aGlzLmRlc3RpbmF0aW9uT2JqO1xuICAgIHZhciBsYXN0VmFsdWVzID0gdGhpcy5jaGVja0xhc3RWYWx1ZXM7XG4gICAgdmFyIGNoZWNrUHJvcGVydGllcyA9IHRoaXMuY2hlY2tQcm9wZXJ0aWVzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hlY2tQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBkZXN0aW5hdGlvbk9ialtjaGVja1Byb3BlcnRpZXNbaV1dO1xuICAgICAgdmFyIGxhc3QgPSBsYXN0VmFsdWVzW2ldO1xuICAgICAgaWYgKHZhbHVlICE9PSBsYXN0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiYgaXNOYU4odmFsdWUpICYmIHR5cGVvZiBsYXN0ID09ICdudW1iZXInICYmIGlzTmFOKGxhc3QpKSB7XG4gICAgICAgICAgLy8gaWdub3JlIGJlY2F1c2UgTmFOICE9IE5hTlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gdGhpc1t0aGlzLnByb3BPdXRzW2ldXTtcbiAgICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChsYXN0VmFsdWVzW2ldID0gdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb3VudDtcbiAgfVxuXG4gIHNldENvbXBvbmVudFByb3BlcnR5KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIHRoaXMuZGVzdGluYXRpb25PYmpbdGhpcy5wcm9wZXJ0eU1hcFtuYW1lXV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZVJlcXVpcmVkKCRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIHJlcXVpcmU6IHN0cmluZyB8IHN0cmluZ1tdKTogYW55IHtcbiAgICBpZiAoIXJlcXVpcmUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PSAnc3RyaW5nJykge1xuICAgICAgdmFyIG5hbWU6IHN0cmluZyA9IDxzdHJpbmc+cmVxdWlyZTtcbiAgICAgIHZhciBpc09wdGlvbmFsID0gZmFsc2U7XG4gICAgICB2YXIgc3RhcnRQYXJlbnQgPSBmYWxzZTtcbiAgICAgIHZhciBzZWFyY2hQYXJlbnRzID0gZmFsc2U7XG4gICAgICB2YXIgY2g6IHN0cmluZztcbiAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PSAnPycpIHtcbiAgICAgICAgaXNPcHRpb25hbCA9IHRydWU7XG4gICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxKTtcbiAgICAgIH1cbiAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PSAnXicpIHtcbiAgICAgICAgc2VhcmNoUGFyZW50cyA9IHRydWU7XG4gICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxKTtcbiAgICAgIH1cbiAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PSAnXicpIHtcbiAgICAgICAgc3RhcnRQYXJlbnQgPSB0cnVlO1xuICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBrZXkgPSBjb250cm9sbGVyS2V5KG5hbWUpO1xuICAgICAgaWYgKHN0YXJ0UGFyZW50KSAkZWxlbWVudCA9ICRlbGVtZW50LnBhcmVudCgpO1xuICAgICAgdmFyIGRlcCA9IHNlYXJjaFBhcmVudHMgPyAkZWxlbWVudC5pbmhlcml0ZWREYXRhKGtleSkgOiAkZWxlbWVudC5kYXRhKGtleSk7XG4gICAgICBpZiAoIWRlcCAmJiAhaXNPcHRpb25hbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbG9jYXRlICcke3JlcXVpcmV9JyBpbiAnJHt0aGlzLmRpcmVjdGl2ZS5uYW1lfScuYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVwO1xuICAgIH0gZWxzZSBpZiAocmVxdWlyZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICB2YXIgZGVwcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXF1aXJlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlcHMucHVzaCh0aGlzLnJlc29sdmVSZXF1aXJlZCgkZWxlbWVudCwgcmVxdWlyZVtpXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlcHM7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYERpcmVjdGl2ZSAnJHt0aGlzLmRpcmVjdGl2ZS5uYW1lfScgcmVxdWlyZSBzeW50YXggdW5yZWNvZ25pemVkOiAke3RoaXMuZGlyZWN0aXZlLnJlcXVpcmV9YCk7XG4gIH1cbn1cbiJdfQ==