import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
var obs = new Observable((obs) => {
    var i = 0;
    setInterval(() => obs.next(++i), 1000);
});
obs.map((i) => `${i} seconds elapsed`).subscribe(msg => console.log(msg));
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZV9wYXRjaGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1JUExwWjFYMS50bXAvYW5ndWxhcjIvZXhhbXBsZXMvZmFjYWRlL3RzL2FzeW5jL29ic2VydmFibGVfcGF0Y2hlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FDTyxFQUFDLFVBQVUsRUFBYSxNQUFNLFNBQVM7T0FDdkMsdUJBQXVCO0FBRTlCLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxDQUFTLENBQUMsR0FBb0I7SUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVMsS0FBSyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsRixnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAjZG9jcmVnaW9uIE9ic2VydmFibGVcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3Vic2NyaWJlcn0gZnJvbSAncnhqcy9SeCc7XG5pbXBvcnQgJ3J4anMvYWRkL29wZXJhdG9yL21hcCc7XG5cbnZhciBvYnMgPSBuZXcgT2JzZXJ2YWJsZTxudW1iZXI+KChvYnM6IFN1YnNjcmliZXI8YW55PikgPT4ge1xuICB2YXIgaSA9IDA7XG4gIHNldEludGVydmFsKCgpID0+IG9icy5uZXh0KCsraSksIDEwMDApO1xufSk7XG5vYnMubWFwKChpOiBudW1iZXIpID0+IGAke2l9IHNlY29uZHMgZWxhcHNlZGApLnN1YnNjcmliZShtc2cgPT4gY29uc29sZS5sb2cobXNnKSk7XG4vLyAjZW5kZG9jcmVnaW9uXG4iXX0=