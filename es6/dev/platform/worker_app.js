import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { WORKER_APP_PLATFORM, WORKER_APP_PLATFORM_MARKER } from 'angular2/src/platform/worker_app_common';
import { WORKER_APP_APPLICATION } from 'angular2/src/platform/worker_app';
import { ReflectiveInjector, coreLoadAndBootstrap, getPlatform, createPlatform, assertPlatform } from 'angular2/core';
export { WORKER_APP_PLATFORM, WORKER_APP_APPLICATION_COMMON } from 'angular2/src/platform/worker_app_common';
export { WORKER_APP_APPLICATION } from 'angular2/src/platform/worker_app';
export { ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments } from 'angular2/src/web_workers/shared/client_message_broker';
export { ReceivedMessage, ServiceMessageBroker, ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
export { PRIMITIVE } from 'angular2/src/web_workers/shared/serializer';
export * from 'angular2/src/web_workers/shared/message_bus';
export { AngularEntrypoint } from 'angular2/src/core/angular_entrypoint';
export { WORKER_APP_ROUTER } from 'angular2/src/web_workers/worker/router_providers';
export function workerAppPlatform() {
    if (isBlank(getPlatform())) {
        createPlatform(ReflectiveInjector.resolveAndCreate(WORKER_APP_PLATFORM));
    }
    return assertPlatform(WORKER_APP_PLATFORM_MARKER);
}
export function bootstrapApp(appComponentType, customProviders) {
    var appInjector = ReflectiveInjector.resolveAndCreate([WORKER_APP_APPLICATION, isPresent(customProviders) ? customProviders : []], workerAppPlatform().injector);
    return coreLoadAndBootstrap(appInjector, appComponentType);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX2FwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSVBMcFoxWDEudG1wL2FuZ3VsYXIyL3BsYXRmb3JtL3dvcmtlcl9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO09BQ3BELEVBQ0wsbUJBQW1CLEVBQ25CLDBCQUEwQixFQUMzQixNQUFNLHlDQUF5QztPQUN6QyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sa0NBQWtDO09BQ2hFLEVBSUwsa0JBQWtCLEVBQ2xCLG9CQUFvQixFQUNwQixXQUFXLEVBQ1gsY0FBYyxFQUNkLGNBQWMsRUFDZixNQUFNLGVBQWU7QUFFdEIsU0FDRSxtQkFBbUIsRUFDbkIsNkJBQTZCLFFBQ3hCLHlDQUF5QyxDQUFDO0FBQ2pELFNBQVEsc0JBQXNCLFFBQU8sa0NBQWtDLENBQUM7QUFDeEUsU0FDRSxtQkFBbUIsRUFDbkIsMEJBQTBCLEVBQzFCLEtBQUssRUFDTCxXQUFXLFFBQ04sdURBQXVELENBQUM7QUFDL0QsU0FDRSxlQUFlLEVBQ2Ysb0JBQW9CLEVBQ3BCLDJCQUEyQixRQUN0Qix3REFBd0QsQ0FBQztBQUNoRSxTQUFRLFNBQVMsUUFBTyw0Q0FBNEMsQ0FBQztBQUNyRSxjQUFjLDZDQUE2QyxDQUFDO0FBQzVELFNBQVEsaUJBQWlCLFFBQU8sc0NBQXNDLENBQUM7QUFDdkUsU0FBUSxpQkFBaUIsUUFBTyxrREFBa0QsQ0FBQztBQUVuRjtJQUNFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixjQUFjLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFDRCxNQUFNLENBQUMsY0FBYyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUVELDZCQUNJLGdCQUFzQixFQUN0QixlQUF3RDtJQUMxRCxJQUFJLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FDakQsQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsZUFBZSxHQUFHLEVBQUUsQ0FBQyxFQUMzRSxpQkFBaUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1xuICBXT1JLRVJfQVBQX1BMQVRGT1JNLFxuICBXT1JLRVJfQVBQX1BMQVRGT1JNX01BUktFUlxufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX2FwcF9jb21tb24nO1xuaW1wb3J0IHtXT1JLRVJfQVBQX0FQUExJQ0FUSU9OfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX2FwcCc7XG5pbXBvcnQge1xuICBQbGF0Zm9ybVJlZixcbiAgVHlwZSxcbiAgQ29tcG9uZW50UmVmLFxuICBSZWZsZWN0aXZlSW5qZWN0b3IsXG4gIGNvcmVMb2FkQW5kQm9vdHN0cmFwLFxuICBnZXRQbGF0Zm9ybSxcbiAgY3JlYXRlUGxhdGZvcm0sXG4gIGFzc2VydFBsYXRmb3JtXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5leHBvcnQge1xuICBXT1JLRVJfQVBQX1BMQVRGT1JNLFxuICBXT1JLRVJfQVBQX0FQUExJQ0FUSU9OX0NPTU1PTlxufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX2FwcF9jb21tb24nO1xuZXhwb3J0IHtXT1JLRVJfQVBQX0FQUExJQ0FUSU9OfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vd29ya2VyX2FwcCc7XG5leHBvcnQge1xuICBDbGllbnRNZXNzYWdlQnJva2VyLFxuICBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSxcbiAgRm5BcmcsXG4gIFVpQXJndW1lbnRzXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvY2xpZW50X21lc3NhZ2VfYnJva2VyJztcbmV4cG9ydCB7XG4gIFJlY2VpdmVkTWVzc2FnZSxcbiAgU2VydmljZU1lc3NhZ2VCcm9rZXIsXG4gIFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeVxufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcnZpY2VfbWVzc2FnZV9icm9rZXInO1xuZXhwb3J0IHtQUklNSVRJVkV9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5leHBvcnQgKiBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmV4cG9ydCB7QW5ndWxhckVudHJ5cG9pbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2FuZ3VsYXJfZW50cnlwb2ludCc7XG5leHBvcnQge1dPUktFUl9BUFBfUk9VVEVSfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3JvdXRlcl9wcm92aWRlcnMnO1xuXG5leHBvcnQgZnVuY3Rpb24gd29ya2VyQXBwUGxhdGZvcm0oKTogUGxhdGZvcm1SZWYge1xuICBpZiAoaXNCbGFuayhnZXRQbGF0Zm9ybSgpKSkge1xuICAgIGNyZWF0ZVBsYXRmb3JtKFJlZmxlY3RpdmVJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFdPUktFUl9BUFBfUExBVEZPUk0pKTtcbiAgfVxuICByZXR1cm4gYXNzZXJ0UGxhdGZvcm0oV09SS0VSX0FQUF9QTEFURk9STV9NQVJLRVIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9vdHN0cmFwQXBwKFxuICAgIGFwcENvbXBvbmVudFR5cGU6IFR5cGUsXG4gICAgY3VzdG9tUHJvdmlkZXJzPzogQXJyYXk8YW55IC8qVHlwZSB8IFByb3ZpZGVyIHwgYW55W10qLz4pOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICB2YXIgYXBwSW5qZWN0b3IgPSBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShcbiAgICAgIFtXT1JLRVJfQVBQX0FQUExJQ0FUSU9OLCBpc1ByZXNlbnQoY3VzdG9tUHJvdmlkZXJzKSA/IGN1c3RvbVByb3ZpZGVycyA6IFtdXSxcbiAgICAgIHdvcmtlckFwcFBsYXRmb3JtKCkuaW5qZWN0b3IpO1xuICByZXR1cm4gY29yZUxvYWRBbmRCb290c3RyYXAoYXBwSW5qZWN0b3IsIGFwcENvbXBvbmVudFR5cGUpO1xufVxuIl19