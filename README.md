
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


## issues

Flerbostadshus, lokal, fotnoter bör dubbelkollas.
ep limit för class A-G bör dubbelkollas

css could use some work


## Help-icon logic

For any key `x` where `strings.js` defines a non-empty `x_help` entry, the
interface will automatically generate a “?” icon and a matching help box. If the
elements `x_help_icon` or `x_help` do not already exist in the DOM they will be
created next to the label (or the element itself) and wired to show the help
text on click.




---


## Development and Testing

Run the automated tests by opening `tests.html` in a browser.
Run the C tests with `./run_tests.sh` and check `test_output.txt` for results.


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
| `tests.html`      |  test file(not very good) |


---

## Screenshots

### Main Interface

![Screenshot of the website](screenshot.png)

### Printed Certificate PDF

![Screenshot of the print output](screenshot_output.png)

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENCE.txt).
