The webdev-rest is a two part assignment from CISC 375. The first part was to create a RESTful server using Javascript for St. Paul crime data. The server uses multiple API routes in order to retrieve specific data. These routes include GET /codes, GET /neighborhoods, GET /incidents, PUT /new-incident, and DELETE /remove-incident. Each one should display or send the correct data to our St. Paul crime database. The second part consists of creating a single page application utilizing the St. Paul crime API, Leaflet, and Nominatim. This final application, with the help of the Vue.js framework, would create an iteractive, responsive, page and allow users to investigate crimes from various St. Paul neighborhoods. 

This single-page application will feature an interactive map using the Leaflet API, allowing users to pan and zoom within the boundaries of St. Paul. Users can search for specific locations by entering an address or latitude/longitude coordinates, with the map updating accordingly and vice versa. Integration with the Nominatim API will enable seamless conversion between addresses and coordinates, while ensuring location inputs remain within St. Paul. The app will fetch crime data from a St. Paul Crime API, displaying up to 1,000 recent incidents in a sortable table, filtered to show only crimes within the visible map area. Crime markers will be plotted on the map by neighborhood, with popups summarizing crime counts. Additional features include a form for submitting new crime incidents, a page showcasing team bios and project details, UI controls to filter crime data by type, date range, neighborhood, and more, and options to delete individual incidents or highlight them on the map. Styling enhancements, data categorization, and a video demo will further enrich the user experience.

To run this code you should download the provided St. Paul crime database from the assets and create a subfolder in your project named "db" and move the database to that folder. You should also install Node.js if not already installed. Clone the repository into your designated folder and run:
```
npm install
```
Change directory to the folder containing the respository and run:
```
node rest_server.mjs
```
Once the erver is running you can visit the website with your browser at http://localhost:8000.
