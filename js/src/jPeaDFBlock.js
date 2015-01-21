var jPeaDFBlock = function(options) {
    this.debug = {creation: false};
    //this.debug = false;
    this.pdf_obj = null;
    this.parent = null;
    this.blocks = [];
    this.options = {};
    createStandardOptions(this, options);
}

jPeaDFBlock.prototype.addItem = function(item) {
    item.setPdfObj(this.pdf_obj);
    item.setParent(this);
    this.blocks.push(item);
}

jPeaDFBlock.prototype.setParent = function(p) {
    this.parent = p;
}

jPeaDFBlock.prototype.setPdfObj = function(obj) {
    this.pdf_obj = obj;
    for (var i = 0; i < this.blocks.length; i++) {
        this.blocks[i].setPdfObj(obj);
    }
}

jPeaDFBlock.prototype.calculateSize2 = function(parent) {
    var obj = this.pdf_obj;

    // ****** Updating the position based on the margin//
    obj.doc.setFontSize(this.options.font_size);// set the font size of this item
    applyChildSize(parent, this); // this applies the inital widths and heights

    obj.ypos += this.options.margin_top;
    if (obj.ypos > obj.options.height - obj.options.padding_bottom) {// check if after the margin it flows to the next page!
        obj.goToNextPage();// go to next page
        obj.ypos = obj.options.padding_top; // reset the current y position to zero
    }



    // check the height! if it exceeds to next page. Remember, tables/lists with overflowing texts shouldnt have FIXED height parents
    if (obj.ypos + this.options.height > obj.options.height - obj.options.padding_bottom) {// check if after the margin it flows to the next page!
        obj.goToNextPage();// go to next page
        obj.ypos = obj.options.padding_top + this.options.padding_top; // reset the current y position to zero + the correct paddings for document and paent block!
    }

    this.start_y_page = obj.doc.getPage();// add the margin; // the actual start page of the object
    this.start_y_pos = obj.ypos;
    this.end_y_page = obj.doc.getPage();
    this.end_y_pos = obj.ypos + this.options.height;

    // in case of floaters!   
    var float_ypos = obj.ypos;
    var float_ypage = obj.getPage();
    var max_float_ypos = obj.ypos;
    var max_float_ypage = obj.getPage();

    // draw all of the internals
    for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        // calculate the sizes first
        b.calculateSize2(this);
        if (b.options.floating) {
            float_ypos = b.start_y_pos;
            float_ypage = b.start_y_page;
        }
        
        b.start_y_pos += this.options.padding_top; // add the padding!
        b.posXStart += this.options.padding_left;// remember to add the padding for the left

        // now update the end and start pages for the current block
        if (b.end_y_page > this.end_y_page) {
            this.end_y_page = b.end_y_page;
            this.end_y_pos = b.end_y_pos + this.options.padding_bottom; // add the padding!
        } else if (b.end_y_page === this.end_y_page && b.end_y_pos + this.options.padding_bottom > this.end_y_pos) {
            this.end_y_page = b.end_y_page;
            this.end_y_pos = b.end_y_pos + this.options.padding_bottom;// add the bottom padding
        }
        
        // set the floating point END to be the highest in the current block
        if (b.end_y_page > max_float_ypage ) {
           max_float_ypage = b.end_y_page ;
           max_float_ypos = b.end_y_pos + b.options.padding_bottom; // add the padding!
        } else if (max_float_ypage === b.end_y_page && b.end_y_pos+ b.options.padding_bottom > max_float_ypos) {
            max_float_ypage = b.end_y_page;
            max_float_ypos = b.end_y_pos + b.options.padding_bottom;// add the bottom padding
        }

        // repoint to start if its floating
        if (b.options.floating) {
            // save highest
            obj.goToPage(float_ypage);
            obj.ypos = float_ypos;
        } else {
            obj.ypos = max_float_ypos;
            obj.goToPage(max_float_ypage);
        }

    }
}

// Remember we dont use any margins- all start and end positions are set!
jPeaDFBlock.prototype.draw2 = function() {
    var obj = this.pdf_obj;
    obj.doc.setFontSize(this.options.font_size);
    obj.setColor(this.options.font_color, [0, 0, 0]);
    obj.goToPage(this.start_y_page);
    obj.ypos = this.start_y_pos;


    // draw the background for the item
    obj.drawBackgrounds(this.options.fill_color, this.options.border_width, this.options.border_color, this.start_y_page, this.start_y_pos, this.end_y_page, this.end_y_pos, this.total_height, this.posXStart, this.options.width);
    // draw all the children items
    for (var i = 0; i < this.blocks.length; i++) {
        var b = this.blocks[i];
        b.draw2();
    }
}

