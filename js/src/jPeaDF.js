var jPeaDF = function(options) {
    // the default variables

    this.debug = {creation: true};
    //this.debug = false;
    this.options = {};

    this.options.font_size = (options && options.font_size) || 18;
    this.options.line_height = (options && options.line_height) || 10;
    this.options.page_size = (options && options.page_size) || 'a4';// page size defaul
    this.options.units = (options && options.unit) || 'pt';// defaultunit
    this.options.orientation = (options && options.orientation) || 'p';// default orientation
    this.options.width = this.getDimensionsPts(this.options.page_size)[0];
    this.options.height = this.getDimensionsPts(this.options.page_size)[1];
    this.options.padding_top = (options && options.padding_top) || 5;
    this.options.padding_bottom = (options && options.padding_bottom) || 5;
    this.options.padding_left = (options && options.padding_left) || 5;
    this.options.padding_right = this.getSizeByPercentage(this.options.padding_right, this.options.width, 0) || 5;
    this.options.padding_left = this.getSizeByPercentage(this.options.padding_left, this.options.width, 0) || 5;
    this.options.padding_bottom = this.getSizeByPercentage(this.options.padding_bottom, this.options.height, 0) || 5;
    this.options.padding_top = this.getSizeByPercentage(this.options.padding_top, this.options.height, 0) || 5;

    // setup the document
    this.doc = new jsPDF(this.options.orientation, this.options.units, this.options.page_size);// oreintation, inches, unit
    this.doc.setFontSize(this.options.font_size);


    this.posXStart = this.getSizeByPercentage(this.options.padding_left, this.options.width, 0);
    this.posYStart = this.getSizeByPercentage(this.options.padding_top, this.options.height, 0, 0);

    // now create and update
    this.ypos = this.options.padding_top;
    this.blocks = [];
    if (this.debug && this.debug.creation) {
        window.console.log('Creating jPeaDF-----------');
        window.console.log('Options:');
        window.console.log(this.options);
        window.console.log('Page size: ' + this.options.page_size);
        window.console.log('Width: ' + this.options.width);
        window.console.log('Height: ' + this.options.height);
        window.console.log('Units: ' + this.options.units);
        window.console.log('Orientation: ' + this.options.orientation);
        window.console.log('Padding lrtb: ' + this.options.padding_left + ' ' + this.options.padding_right + ' ' + this.options.padding_top + ' ' + this.options.padding_bottom);
        window.console.log('Start X: ' + this.posXStart);
        window.console.log('Start Y: ' + this.ypos);
        window.console.log('--------------------------\n\n');
    }
};

// function for adding a block
jPeaDF.prototype.addBlock = function(b) {
    b.setPdfObj(this);
    b.setParent(this);
    this.blocks.push(b);
}

// recursive call calls each drawItems in the objects
jPeaDF.prototype.draw = function() {

    for (var i = 0; i < this.blocks.length; i++) {
        var v = this.blocks[i];
        // calulate widths of all blocks at this level based on the parent!
        if (v instanceof jPeaDFBlock) {
            var temp_ypos = 0;
            var temp_page = 0;

            if (v.options.floating) {
                temp_ypos = this.ypos;
                temp_page = this.doc.getPage();
            }

            // is this requierd????
            if (this.ypos + v.options.height > this.options.height - this.options.padding_bottom) {
                this.goToNextPage();
                this.ypos = this.options.padding_top;
            }

            v.options.width = this.getSizeByPercentage(v.options.widthInitial, this.options.width, this.options.padding_left + this.options.padding_right);// works out width AFTER the padding
            v.options.padding_left = this.getSizeByPercentage(v.options.padding_left, v.options.width, 0);
            v.options.padding_right = this.getSizeByPercentage(v.options.padding_right, v.options.width, 0);

            v.options.height = this.getSizeByPercentage(v.options.heightInitial, this.options.height, this.options.padding_top + this.options.padding_bottom);// works out width AFTER the padding
            v.options.padding_top = this.getSizeByPercentage(v.options.padding_top, v.options.height, 0);
            v.options.padding_bottom = this.getSizeByPercentage(v.options.padding_bottom, v.options.height, 0);

            if (this.debug) {
                window.console.log('#' + v.options.id + '  Effective Parent width: ' + this.getSizeByPercentage('100%', this.options.width, this.options.padding_left + this.options.padding_right));
                window.console.log('#' + v.options.id + '  Child width: ' + v.options.width + '(' + v.options.widthInitial + ' of effective width)');
                window.console.log('#' + v.options.id + '  Current Child Left Margin: ' + this.getSizeByPercentage(v.options.margin_left, this.options.width, this.options.padding_left + this.options.padding_right) + '(' + v.options.margin_left + ' of effective width)');
                window.console.log('#' + v.options.id + '  Effective Parent height: ' + this.getSizeByPercentage('100%', this.options.height, this.options.padding_top + this.options.padding_bottom));
                window.console.log('#' + v.options.id + '  Child height: ' + v.options.height + '(' + v.options.heightInitial + ' of effective height)');
                window.console.log('#' + v.options.id + '  Current Child Top Margin: ' + this.getSizeByPercentage(v.options.margin_top, this.options.height, this.options.padding_top + this.options.padding_bottom) + '(' + v.options.margin_left + ' of effective width)');
            }
            v.options.margin_top = this.getSizeByPercentage(v.options.margin_top, this.options.height, this.options.padding_top + this.options.padding_top);// works out width BEFORE the padding
            v.options.margin_left = this.getSizeByPercentage(v.options.margin_left, this.options.width, this.options.padding_left + this.options.padding_right);// works out width BEFORE the padding
            v.posXStart = this.posXStart + v.options.margin_left;
            v.posYStart = this.posYStart + v.options.margin_top;
            if (this.debug) {
                window.console.log('#' + v.options.id + '  New Margin Child Left Margin: ' + v.options.margin_left);
                window.console.log('#' + v.options.id + '  Parent Start x: ' + this.posXStart);
                window.console.log('#' + v.options.id + '  Child Start x: ' + v.posXStart + ' (Child margin[' + v.options.margin_left + '] + Parent[' + this.posXStart + '])');
                window.console.log('#' + v.options.id + '  New Margin Child Top Margin: ' + v.options.margin_top);
                window.console.log('#' + v.options.id + '  Parent Start y: ' + this.posYStart);
                window.console.log('#' + v.options.id + '  Child Start y: ' + v.posYStart + ' (Child margin[' + v.options.margin_top + '] + Parent[' + this.posYStart + '])');

                window.console.log('-----------------------------------');
            }

            v.drawItems();
            // floating block or non floating
            //window.console.log(' after table '+this.block_ypos +'  '+this.block_ypage );
            this.ypos = v.block_ypos;
            //this.block_ypage = v.block_ypage;
            if (v.options.floating) {
                this.ypos = temp_ypos;
                this.doc.goToPage(temp_page);
            }
        }
    }
    // finally go the final page
    //window.console.log('Page after the final: '+v.options.id+' @page = '+v.block_ypage+' @pos ='+v.block_ypos);
    this.doc.goToPage(this.doc.getPages().length - 1);
}

jPeaDF.prototype.setLineWidth = function(a, defaulta) {
    if (!a) {
        this.doc.setLineWidth(defaulta);
    } else {
        this.doc.setLineWidth(a);
    }
}

jPeaDF.prototype.setStyle = function(a) {
    if (!a) {
        this.doc.setFontStyle('normal');
    } else {
        this.doc.setFontStyle(a);
    }
}
jPeaDF.prototype.getPage = function() {
    return this.doc.getPage();
}

jPeaDF.prototype.goToNextPage = function() {

    if (this.doc.getPage() < this.doc.getPages().length - 1) {
        window.console.log('********* Going to page ' + this.doc.getPage() + 1);
        this.doc.goToPage(this.doc.getPage() + 1); // dont add page it already exists
    } else {
        window.console.log('********* Adding a new page');
        this.doc.addPage();
    }
}

jPeaDF.prototype.getOffsetX = function(outer, inner, align, defaulta, addition, padding) {
    if (!align) {
        align = defaulta;
    }
    if (align == 'c') {
        return (outer - (2 * padding) - inner) / 2 + addition + padding;
    } else if (align == 'r') {
        return (outer - (2 * padding) - inner) + addition + padding;
    } else if (align == 'l') {
        return 0 + addition + padding;
    }
    return addition + padding;
}

jPeaDF.prototype.getOffsetY = function(outer, inner, align, defaulta, addition, padding) {
    if (!align) {
        align = defaulta;
    }
    if (align == 'm') {
        return (outer - (2 * padding) - inner) / 2 + addition + padding;
    } else if (align == 'b') {
        return (outer - (2 * padding) - inner) + addition + padding;
    } else if (align == 't') {
        return 0 + addition + padding;
    }
    return addition;
}

jPeaDF.prototype.setColor = function(a, defaulta) {
    if (!a) {
        this.doc.setTextColor(defaulta[0], defaulta[1], defaulta[2], defaulta[3]);
    } else if (a.length === 3) {
        this.doc.setTextColor(a[0], a[1], a[2]);
    } else if (a.length === 4) {
        this.doc.setTextColor(a[0], a[1], a[2], a[3]);
    } else {
        if (defaulta.length === 3) {
            this.doc.setTextColor(defaulta[0], defaulta[1], defaulta[2]);
        } else if (defaulta.length === 4) {
            this.doc.setTextColor(defaulta[0], defaulta[1], defaulta[2], defaulta[3]);
        }
    }
}

jPeaDF.prototype.setFill = function(a, defaulta) {
    if (!a) {
        this.doc.setFillColor(defaulta[0], defaulta[1], defaulta[2], defaulta[3]);
    } else if (a.length === 3) {
        this.doc.setFillColor(a[0], a[1], a[2]);
    } else if (a.length === 4) {
        this.doc.setFillColor(a[0], a[1], a[2], a[3]);
    } else {
        if (defaulta.length === 3) {
            this.doc.setFillColor(defaulta[0], defaulta[1], defaulta[2]);
        } else if (defaulta.length === 4) {
            this.doc.setFillColor(defaulta[0], defaulta[1], defaulta[2], defaulta[3]);
        }
    }
}

jPeaDF.prototype.setLineColor = function(a, defaulta) {
    if (!a) {
        this.doc.setDrawColor(defaulta[0], defaulta[1], defaulta[2], defaulta[3]);
    } else if (a.length === 3) {
        this.doc.setDrawColor(a[0], a[1], a[2]);
    } else if (a.length === 4) {
        this.doc.setDrawColor(a[0], a[1], a[2], a[3]);
    } else {
        if (defaulta.length === 3) {
            this.doc.setDrawColor(defaulta[0], defaulta[1], defaulta[2]);
        } else if (defaulta.length === 4) {
            this.doc.setDrawColor(defaulta[0], defaulta[1], defaulta[2], defaulta[3]);
        }
    }
}


// function for setting a footer

// function for adding a heading


// function for outputting document
jPeaDF.prototype.outputNewTab = function() {
    this.doc.output('dataurlnewwindow');
};

jPeaDF.prototype.output = function() {
    this.doc.output('dataurl');
};

jPeaDF.prototype.save = function(name) {
    this.doc.save(name);
};
