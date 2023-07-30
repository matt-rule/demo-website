# demo-website
Collection of personal projects ported to JS; written in TypeScript and WebGL, served by an ASP.NET 7 web server

### Docker
docker build -t conwaylife .
docker run -it --rm -p 8080:80 conwaylife
Then visit http://127.0.0.1:8080/ in the browser

### Vscode dev in Docker
docker run -it -p 8080:80 conwaylife
(note no --rm this time)
Exit terminal and run from Docker for Windows

Make sure the Dev Containers extension is installed
Click the green box in the bottom left

Connect to the container using the top menu
In the explorer tab, click "Open Folder" and open /app/
If desired, click to open a .cs file and install the C# extension if prompted
Click to open wwwroot/ts/main.ts

In the terminal, run dotnet dev-certs https
If "trusting" the cert is ever required, go to:
https://learn.microsoft.com/en-gb/aspnet/core/security/enforcing-ssl?view=aspnetcore-7.0&tabs=visual-studio%2Clinux-ubuntu#ssl-linux

Make your code changes
Press F5
Browser tab should auto open but if not try localhost:<port> where port is listed in the ports tab.
