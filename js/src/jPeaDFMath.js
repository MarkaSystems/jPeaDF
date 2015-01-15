var PAGE_DIMENSIONS = {
    a4: [595, 842]
};

jPeaDF.prototype.mmToPt = function(n) {
    return n * 2.834645669;
}

jPeaDF.prototype.getDimensionsPts = function(d) {
    
    return PAGE_DIMENSIONS[d];
}

jPeaDF.prototype.getSizeByPercentage = function(width, parent_w, offset) {
    var r = 0;
    if (width && isNaN(width)) {
        // try parsing percentage
        try {
            return parseInt(width.toString()) / 100 * (parent_w - offset);
        } catch (e) {
            return parent_w - offset;
        }
    } else if (width) {
        return width;
    }
    return r;
}