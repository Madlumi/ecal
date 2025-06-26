
# Energy Calculator

Calculates EPpet, in accordance with   Landskapsförordning (2015:5) om Ålands byggbestämmelsesamling

Demo hosted at: [https://madlumi.github.io/ecal/src/energy.html](https://madlumi.github.io/ecal/src/energy.html). (This site is updated manually and may lag behind the latest commits.)


---

## Usage

just serve the files in your preferred way, all the logic happens client side


---

## Features

- **Calculates EPpet**
- **Shows relevant limits**
- **Prints a fancy energy certificate**


## TODO/Issues


### Code Quality
- glue.js ought to be cleaned up or something
- someone ought to add some tests for core calculator(energy.js) logic
- screenshots out of date
- Flerbostadshus, lokal, fotnoter bör dubbelkollas. 

### Usablility
- lack of clear user story n shit
- Languages other than Swedish are auto translated.
- the caltulate/manual toggle is not as elegant a solution as i would want. look into improvements
- Should A-G class colours be displayin in high contrast mode? 
- ui breaks down at around 300px or less.

### Legal
- timvis energikalkyl enlight någon iso bör införas.
- pdf energiklasser A-G har ingen font specifierad inom "Allmänna råd till LANDSKAPSFÖRORDNING om energideklaration för byggnader"
-house/energy class look not defined in reference documents, recreated by eye
- Uncertainty about "Inget Krav" EP grade. It is left as N/A, grey as of now.

## Help-icon logic

For any key `x` where `strings.js` defines a non-empty `x_help` entry, the
interface will automatically generate a “?” icon and a matching help box. If the
elements `x_help_icon` or `x_help` do not already exist in the DOM they will be
created next to the label (or the element itself) and wired to show the help
text on click.




---


## File Structure

| Filename              | Description |
|-----------------------|--------------------------------------------------------------|
| `src/energy.html`      | Main webpage for user interaction |
| `src/energyprint_new.html` | Maintained print-friendly layout |
| `src/energy.js`        | Core calculation logic|
| `src/glue.js`          | Controls the DOM and ui. |
| `src/strings.js`       | User facing strings and translations |
| `src/style.css`        | css |
| `docs/`                | screenshots, TODO list, and assorted notes |


### Configuration

`src/config.js` defines an `APP_INFO` object containing the version and repository URL displayed in the footer.
The same file exposes feature flags under `CONFIG.FEATURES`. Set `HOURLY_MODEL` to
`true` to show a toggle for the prototype hourly simulation in the interface.

## Legal Sources

Legal references used in the app are stored in the `docs/laws/` directory:

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
