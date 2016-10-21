/**
 * Scalar Field
 */
class ScalarField extends Field {

    constructor(params) {
        super(params);

        this.zs = params["zs"];
        this.grid = this._buildGrid();

        this.range = {
            min: Math.min.apply(null, this.zs),
            max: Math.max.apply(null, this.zs)
        }
    }

    /**
     * Builds a grid with a Number at each point, from an array
     * 'zs' following x-ascending & y-descending order
     * (same as in ASCIIGrid)
     * @private
     * @returns {Array.<Array.<Number>>} - grid[row][column]--> Number
     */
    _buildGrid() {
        let grid = [];
        let p = 0;

        for (var j = 0; j < this.nrows; j++) {
            var row = [];
            for (var i = 0; i < this.ncols; i++, p++) {
                let z = this.zs[p];
                row[i] = (this._isValid(z)) ? z : null; // <<<
            }
            grid[j] = row;
        }
        return grid;
    }

    /**
     * Creates a ScalarField from the content of an ASCIIGrid file
     * @param   {String}   asc
     * @returns {ScalarField}
     */
    static fromASCIIGrid(asc) {
        let lines = asc.split('\n');

        // Header
        let n = /-?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/; // any number
        let p = {
            ncols: parseInt(lines[0].match(n)),
            nrows: parseInt(lines[1].match(n)),
            xllcorner: parseFloat(lines[2].match(n)),
            yllcorner: parseFloat(lines[3].match(n)),
            cellsize: parseFloat(lines[4].match(n))
        };
        let NODATA_value = lines[5].replace('NODATA_value', '').trim();

        // Data (left-right and top-down)
        let zs = []; //
        for (let i = 6; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line === '') break;

            let items = line.split(' ');
            let values = items.map(it => {
                return (it !== NODATA_value) ? parseFloat(it) : null;
            });
            zs.push(...values);
        }
        p.zs = zs;

        return new ScalarField(p);
    }

    /**
     * Bilinear interpolation for Number
     * https://en.wikipedia.org/wiki/Bilinear_interpolation
     * @param   {Number} x
     * @param   {Number} y
     * @param   {Number} g00
     * @param   {Number} g10
     * @param   {Number} g01
     * @param   {Number} g11
     * @returns {Number}
     */
    _doInterpolation(x, y, g00, g10, g01, g11) {
        var rx = (1 - x);
        var ry = (1 - y);
        return g00 * rx * ry + g10 * x * ry + g01 * rx * y + g11 * x * y;
    }

}