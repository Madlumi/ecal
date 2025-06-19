
# Energy Calculator

Calculates EPpet, in accordance with   Landskapsförordning (2015:5) om Ålands byggbestämmelsesamling

Demo hosted at: [https://madlumi.github.io/ecal/energy.html](https://madlumi.github.io/ecal/energy.html). (This site is updated manually and may lag behind the latest commits.)


---

## Usage

just serve the files in your preferred way, all the logic happens client side


---

## Features

- **Calculates EPpet**  
- **Shows relevant limits**  
- **Prints a fancy energy certificate**

---


## TODO

Flerbostadshus, lokal, fotnoter bör dubbelkollas.
ep limit för class A-G bör dubbelkollas(found the source 2014:31) 

should make pdf output mimic official doc
css could use some work




## Help-icon logic

For any key `x` where `strings.js` defines a non-empty `x_help` entry, the
interface will automatically generate a “?” icon and a matching help box. If the
elements `x_help_icon` or `x_help` do not already exist in the DOM they will be
created next to the label (or the element itself) and wired to show the help
text on click.




---


## File Structure

| Filename           | Description                                                    |
|--------------------|----------------------------------------------------------------|
| `energy.html`      | Main webpage for user interaction                               |
| `energyprint.html` | A page to print out energy certificate thingie      |
| `energy.js`        | Core calculation logic, (transpiled from ´dev/energy.c´ using gippy) |
| `glue.js`          | Controls the DOM and ui. |
| `strings.js`       | User facing strings and translations           |
| `style.css`        |     css                                                             |
| `dev/`      | marginally useful files for developement|
| `docs/`     | screenshots, TODO list, and assorted notes|

### Configuration

`config.js` defines an `APP_INFO` object containing the version and repository URL displayed in the footer.

## Legal Sources

Legal references used in the app are stored in the `sources/` directory:

- `201431.txt` – Landskapslag (2014:31) om energideklaration för byggnader
- `202511.txt` – Landskapsförordning (2025:11) om fastställande av byggnadens energianvändning
- `ventilation_guidance.txt` – Anteckningar om ventilationsanvisningar


---

## Screenshots

### Main Interface

![Screenshot showing the energy calculator's main interface](docs/screenshot.png)

### Printed Certificate PDF

![Screenshot showing a generated energy certificate PDF](docs/screenshot_output.png)

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENCE.txt).
