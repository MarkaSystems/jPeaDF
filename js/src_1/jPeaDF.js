var jPeaDF = function(options) {
    // the default variables

    this.debug = {creation: false};
    //this.debug = false;
    this.options = {};

    this.options.h1 = (options && options.h1) || {size: 18};
    this.options.h2 = (options && options.h2) || {size: 18};
    this.options.h3 = (options && options.h3) || {size: 18};
    this.options.h4 = (options && options.h4) || {size: 18};

    this.options.font_size = (options && options.font_size) || 12;
    this.options.line_height = (options && options.line_height) || 12;
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

};

// function for adding a block
jPeaDF.prototype.addItem = function(b) {
    b.setPdfObj(this);
    b.setParent(this);
    this.blocks.push(b);
}

// recursive call calls each drawItems in the objects
jPeaDF.prototype.draw = function() {
    for (var i = 0; i < this.blocks.length; i++) {
        var v = this.blocks[i];
        // calulate widths of all blocks at this level based on the parent!
        if (v) {
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

            v.options.margin_top = this.getSizeByPercentage(v.options.margin_top, this.options.height, this.options.padding_top + this.options.padding_top);// works out width BEFORE the padding
            v.options.margin_left = this.getSizeByPercentage(v.options.margin_left, this.options.width, this.options.padding_left + this.options.padding_right);// works out width BEFORE the padding
            v.posXStart = this.posXStart + v.options.margin_left;
            v.posYStart = this.posYStart + v.options.margin_top;
           
           // calculate then go back to  the start
            var orig_ypos = this.ypos;
            var orig_page = this.doc.getPage();
            v.calculateSize();
            this.ypos=orig_ypos;
            this.doc.goToPage(orig_page);
            
            
            v.drawItems();
            // floating block or non floating
            // update current position


            if (v.block_ypage > this.doc.getPage()) {
                this.doc.goToPage(v.block_ypage);
                this.ypos = v.block_ypos;
            } else if (v.block_ypage == this.doc.getPage() && v.block_ypos > this.ypos) {
                this.ypos = v.block_ypos;
            }

            //this.block_ypage = v.block_ypage;
            if (v.options.floating) {
                this.ypos = temp_ypos;
                this.doc.goToPage(temp_page);
            }
        }
    }
    // finally go the final page
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
    // if padding is an array its always lrtb
    if (!align) {
        align = defaulta;
    }
    if (align == 'c') {
        return (outer - (padding[0] + padding[1]) - inner) / 2 + addition + padding[0];
    } else if (align == 'r') {
        return (outer - (padding[0] + padding[1]) - inner) + addition + padding[0];
    } else if (align == 'l') {
        return 0 + addition + padding[0];
    }
    return addition + padding;
}

jPeaDF.prototype.getOffsetY = function(outer, inner, align, defaulta, addition, padding) {

    if (!align) {
        align = defaulta;
    }
    if (align == 'm') {
        return (outer - (padding[0] + padding[1]) - inner) / 2 + addition + padding[0];
    } else if (align == 'b') {
        return (outer - (padding[0] + padding[1]) - inner) + addition + padding[0];
    } else if (align == 't') {
        return 0 + addition + padding[0];
    }
    return addition + padding;
}

// when using soplit string- make sure PDF Font size is changed
jPeaDF.prototype.drawSplitText = function(text, font_size, line_spacing, width, height, start_pos_x, start_pos_y, padding, halign, valign, overflow) {
    var temp_yoffset = this.getOffsetY(height, line_spacing * text.length, null, valign, font_size, [padding[2], padding[3]]);
    var current_y = 0;
    for (var i = 0; i < text.length; i++) {
        var temp_xoffset = this.getOffsetX(width, this.doc.getStringUnitWidth(text[i]) * font_size, null, halign, 0, [padding[0], padding[1]]);
        // go through each line!
        this.doc.text(start_pos_x + temp_xoffset, this.ypos + temp_yoffset + current_y + start_pos_y, text[i].toString());
        current_y += line_spacing;
    }
}

jPeaDF.prototype.drawBackgrounds = function(fill, border_width, border_color, start_page, start_pos, end_page, end_pos, total_height, x, width) {
    // go to start page
    var orig_page = this.doc.getPage();
    var orig_pos = this.ypos;
    var t_page = start_page;
    var t_pos = start_pos;
    while (t_page <= end_page) {
        if (t_page < end_page) {
            if (fill) {
                this.setFill(null, fill);
                this.doc.rect(x, t_pos, width, this.options.height - this.options.padding_bottom - t_pos, 'F');// tpos will be padding_top if new page!
            }
            if (border_width) {
                this.setLineWidth(null, border_width);
                this.setLineColor(null, border_color);
                this.doc.rect(x, t_pos, width, this.options.height -  this.options.padding_bottom - t_pos, 'D');// tpos will be padding_top if new page!
            }
            this.goToNextPage();
            t_pos = this.options.padding_top;
            
                
        } else {
            if (fill) {
                this.setFill(null, fill);
                this.doc.rect(x, t_pos, width, end_pos-t_pos, 'F');
            }
            if (border_width) {
                this.setLineWidth(null, border_width);
                this.setLineColor(null, border_color);
                this.doc.rect(x, t_pos, width, end_pos-t_pos, 'D');
            }
        }
        t_page++;
    }
    
    this.doc.goToPage(orig_page);
    this.ypos = orig_pos;
};


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


