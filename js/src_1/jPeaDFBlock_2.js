var jPeaDFBlock = function(options) {
    this.debug = {creation: false};
    //this.debug = false;
    this.pdf_obj = null;
    this.parent = null;
    this.posXStart = 0;
    this.posYStart = 0;
    this.blocks = [];
    this.block_ypos = 0;
    this.block_ypage = 0;

    this.start_y_pos = 0;
    this.start_y_page = 0;
    this.end_y_pos = 0;
    this.end_y_page = 0;
    this.total_height = 0;

    this.options = {};

    // the block options
    this.options.id = (options && options.id) || 'Undefined ID';
    this.options.floating = (options && options.floating) || false;
    this.options.widthInitial = (options && options.width) || '100%';
    this.options.heightInitial = (options && options.height) || '0%';
    this.options.padding_left = (options && options.padding_left) || 0;
    this.options.padding_right = (options && options.padding_right) || 0;
    this.options.padding_top = (options && options.padding_top) || 0;
    this.options.padding_bottom = (options && options.padding_bottom) || 0;
    this.options.border_color = (options && options.border_color) || null;
    this.options.border_width = (options && options.border_width) || 0;
    this.options.fill_color = (options && options.fill_color) || null;
    this.options.margin_left = (options && options.margin_left) || 0;
    this.options.margin_right = (options && options.margin_right) || 0;
    this.options.margin_top = (options && options.margin_top) || 0;
    this.options.margin_bottom = (options && options.margin_bottom) || 0;

    if (this.debug && this.debug.creation) {
        window.console.log('Creating jPeaDFBlock-----------');
        window.console.log('Options:');
        window.console.log(this.options);
        window.console.log('Id: ' + this.options.id);
        window.console.log('floating: ' + this.options.floating);
        window.console.log('Width: ' + this.options.widthInitial);
        window.console.log('Height: ' + this.options.heightInitial);
        window.console.log('Margin lrtb: ' + this.options.margin_left + ' ' + this.options.margin_right + ' ' + this.options.margin_top + ' ' + this.options.margin_bottom);
        window.console.log('Padding lrtb: ' + this.options.padding_left + ' ' + this.options.padding_right + ' ' + this.options.padding_top + ' ' + this.options.padding_bottom);
        window.console.log('--------------------------\n\n');
    }
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

jPeaDFBlock.prototype.calculateSize = function() {
    this.start_y_page = this.pdf_obj.doc.getPage();
    this.start_y_pos = this.pdf_obj.ypos;
    this.end_y_page = this.pdf_obj.doc.getPage();
    this.end_y_pos = this.pdf_obj.ypos;

    for (var i = 0; i < this.blocks.length; i++) {
        var v = this.blocks[i];
        v.options.padding_left = this.pdf_obj.getSizeByPercentage(v.options.padding_left, v.options.width, 0);
        v.options.padding_right = this.pdf_obj.getSizeByPercentage(v.options.padding_right, v.options.width, 0);
        v.options.padding_top = this.pdf_obj.getSizeByPercentage(v.options.padding_top, v.options.height, 0);
        v.options.padding_bottom = this.pdf_obj.getSizeByPercentage(v.options.padding_bottom, v.options.height, 0);
        v.options.width = this.pdf_obj.getSizeByPercentage(v.options.widthInitial, this.options.width, this.options.padding_left + this.options.padding_right);// works out width AFTER the padding
        v.options.padding_left = this.pdf_obj.getSizeByPercentage(v.options.padding_left, v.options.width, 0);
        v.options.padding_right = this.pdf_obj.getSizeByPercentage(v.options.padding_right, v.options.width, 0);

        v.options.height = this.pdf_obj.getSizeByPercentage(v.options.heightInitial, this.options.height, this.options.padding_top + this.options.padding_bottom);// works out width AFTER the padding
        v.options.padding_top = this.pdf_obj.getSizeByPercentage(v.options.padding_top, v.options.height, 0);
        v.options.padding_bottom = this.pdf_obj.getSizeByPercentage(v.options.padding_bottom, v.options.height, 0)

        v.options.margin_top = this.pdf_obj.getSizeByPercentage(v.options.margin_top, this.options.height, this.options.padding_top + this.options.padding_top);// works out width BEFORE the padding
        v.options.margin_left = this.pdf_obj.getSizeByPercentage(v.options.margin_left, this.options.width, this.options.padding_left + this.options.padding_right);// works out width BEFORE the padding
        v.posXStart = this.posXStart + v.options.margin_left;
        v.posYStart = this.posYStart + v.options.margin_top;

        if (v instanceof jPeaDFList) {
            v.options.indent = this.pdf_obj.getSizeByPercentage(v.options.indentInitial, this.options.width, this.options.padding_left + this.options.padding_right);// works out width AFTER the padding
        }

        v.calculateSize();
        this.pdf_obj.ypos = v.end_y_pos;
        this.pdf_obj.doc.goToPage(v.end_y_page);

        // uodate this size based on childrens max height
        if (v.end_y_page > this.end_y_page) {
            this.end_y_page = v.end_y_page;
            this.end_y_pos = v.end_y_pos;
        } else if (v.end_y_page == this.end_y_page && v.end_y_pos > this.end_y_pos) {
            this.end_y_page = v.end_y_page;
            this.end_y_pos = v.end_y_pos;
        }
    }
    this.pdf_obj.doc.setFontSize(this.pdf_obj.options.font_size);
}

// recursive
jPeaDFBlock.prototype.drawItems = function() {
    //this.calculateSize();
    var temp_ypos = 0;
    var temp_page = 0;
    if (this.options.floating) {
        temp_ypos = this.pdf_obj.ypos;
        temp_page = this.pdf_obj.doc.getPage();
    }
    // add the margin top
    this.pdf_obj.ypos = this.pdf_obj.ypos + this.options.margin_top;

    this.pdf_obj.drawBackgrounds(this.options.fill_color, this.options.border_width, this.options.border_color, this.start_y_page, this.start_y_pos, this.end_y_page, this.end_y_pos, this.total_height, this.posXStart, this.options.width);
    // if block will flow to next page!
    if (this.pdf_obj.ypos + this.options.height > this.pdf_obj.options.height - this.pdf_obj.options.padding_bottom) {
        this.pdf_obj.goToNextPage();
        this.pdf_obj.ypos = this.pdf_obj.options.padding_top;
    }
    this.block_ypos = this.pdf_obj.ypos + this.options.height;


    for (var i = 0; i < this.blocks.length; i++) {
        var v = this.blocks[i];
        var temp_ypos_inner = 0;
        var temp_page_inner = 0;
        var current_temp_ypos_inner = this.pdf_obj.ypos;
        var current_temp_page_inner = this.pdf_obj.doc.getPage();

        if (v.options.floating) {
            temp_ypos_inner = current_temp_ypos_inner;
            temp_page_inner = current_temp_page_inner;
        } else {
            current_temp_ypos_inner = this.pdf_obj.ypos;
            current_temp_page_inner = this.pdf_obj.doc.getPage();

        }

        // add the margin top
        this.pdf_obj.ypos = this.pdf_obj.ypos + this.options.margin_top;

        if (v instanceof jPeaDFBlock) {
            v.drawItems();
            this.block_ypage = this.pdf_obj.doc.getPage();
            if (v.block_ypage > this.block_ypage) {
                this.block_ypage = v.block_ypage;
                this.block_ypos = v.block_ypos;
            } else if (v.block_ypage == this.block_ypage && v.block_ypos > this.block_ypos) {
                this.block_ypos = v.block_ypos;
            }
        } else if (v) {
            v.drawItems();
            this.block_ypage = this.pdf_obj.doc.getPage();
            if (v.block_ypage > this.block_ypage) {
                this.block_ypage = v.block_ypage;
                this.block_ypos = v.block_ypos;
            } else if (v.block_ypage == this.block_ypage && v.block_ypos > this.block_ypos) {
                this.block_ypos = v.block_ypos;
            }
        }


        this.pdf_obj.ypos = this.block_ypos;
        this.pdf_obj.doc.goToPage(this.block_ypage);

        this.block_ypage = this.pdf_obj.doc.getPage();
        if (v.options.floating) {
            window.console.log('Floating block ' + v.options.id);
            this.pdf_obj.ypos = temp_ypos_inner;
            this.pdf_obj.doc.goToPage(temp_page_inner);
        }
    }

    //this.block_ypos = this.pdf_obj.ypos+this.options.height;
    this.block_ypage = this.pdf_obj.doc.getPage();
    if (this.options.floating) {
        window.console.log('Floating block ' + this.options.id);
        this.pdf_obj.ypos = temp_ypos;
        this.pdf_obj.doc.goToPage(temp_page);
    }
    // revert to standard font!
    this.pdf_obj.doc.setFontSize(this.pdf_obj.options.font_size);
}
