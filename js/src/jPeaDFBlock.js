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

    this.options = {};

    // the block options
    this.options.id = (options && options.id) || 'Undefined ID';
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

// recursive
jPeaDFBlock.prototype.drawItems = function() {

    var temp_ypos = 0;
    var temp_page = 0;
    if (this.options.floating) {
        temp_ypos = this.pdf_obj.ypos;
        temp_page = this.pdf_obj.doc.getPage();
    }
    // add the margin top
    this.pdf_obj.ypos = this.pdf_obj.ypos + this.options.margin_top;

    // if block will flow to next page!
    window.console.log('Height initial ' + this.options.heightInitial);
    if (this.pdf_obj.ypos + this.options.height > this.pdf_obj.options.height - this.pdf_obj.options.padding_bottom) {
        this.pdf_obj.goToNextPage();
        this.pdf_obj.ypos = this.pdf_obj.options.padding_top;
    }

    window.console.log('#' + this.options.id + ' Drawing block at ' + this.posXStart + ' , ' + this.pdf_obj.ypos + '  [ ' + this.options.width + ' , ' + this.options.height + ']');
    if (this.options.fill_color) {
        this.pdf_obj.setFill(null, this.options.fill_color);
        this.pdf_obj.doc.rect(this.posXStart, this.pdf_obj.ypos, this.options.width, this.options.height, 'F');
    }
    if (this.options.border_color) {
        this.pdf_obj.setLineWidth(null, this.options.border_width);
        this.pdf_obj.setLineColor(null, this.options.border_color);
        this.pdf_obj.doc.rect(this.posXStart, this.pdf_obj.ypos, this.options.width, this.options.height, 'D');
    }
    this.block_ypos = this.pdf_obj.ypos + this.options.height;


    // draw the block!



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


        if (this.pdf_obj.debug) {
            window.console.log('#' + v.options.id + '  Effective Parent width: ' + this.pdf_obj.getSizeByPercentage('100%', this.options.width, this.options.padding_left + this.options.padding_right));
            window.console.log('#' + v.options.id + '  Child width: ' + v.options.width + '(' + v.options.widthInitial + ' of effective width)');
            window.console.log('#' + v.options.id + '  Current Child Left Margin: ' + this.pdf_obj.getSizeByPercentage(v.options.margin_left, this.options.width, this.options.padding_left + this.options.padding_right) + '(' + v.options.margin_left + ' of effective width)');
            window.console.log('#' + v.options.id + '  Effective Parent height: ' + this.pdf_obj.getSizeByPercentage('100%', this.options.height, this.options.padding_top + this.options.padding_bottom));
            window.console.log('#' + v.options.id + '  Child height: ' + v.options.height + '(' + v.options.heightInitial + ' of effective height)');
            window.console.log('#' + v.options.id + '  Current Child Top Margin: ' + this.pdf_obj.getSizeByPercentage(v.options.margin_top, this.options.height, this.options.padding_bottom + this.options.padding_left) + '(' + v.options.margin_top + ' of effective height)');
        }
        window.console.log(v.options.padding_left + '  x  ' + this.options.padding_right);
        v.options.margin_top = this.pdf_obj.getSizeByPercentage(v.options.margin_top, this.options.height, this.options.padding_top + this.options.padding_top);// works out width BEFORE the padding
        v.options.margin_left = this.pdf_obj.getSizeByPercentage(v.options.margin_left, this.options.width, this.options.padding_left + this.options.padding_right);// works out width BEFORE the padding
        v.posXStart = this.posXStart + v.options.margin_left;
        v.posYStart = this.posYStart + v.options.margin_top;

        if (v instanceof jPeaDFList) {
            v.options.indent = this.pdf_obj.getSizeByPercentage(v.options.indentInitial, this.options.width, this.options.padding_left + this.options.padding_right);// works out width AFTER the padding
        }


        if (this.pdf_obj.debug) {
            window.console.log('#' + v.options.id + '  New Margin Child Left Margin: ' + v.options.margin_left);
            window.console.log('#' + v.options.id + '  Parent Start x: ' + this.posXStart);
            window.console.log('#' + v.options.id + '  Child Start x: ' + v.posXStart + ' (Child margin[' + v.options.margin_left + '] + Parent[' + this.posXStart + '])');
            window.console.log('#' + v.options.id + '  New Margin Child Top Margin: ' + v.options.margin_top);
            window.console.log('#' + v.options.id + '  Parent Start y: ' + this.posYStart);
            window.console.log('#' + v.options.id + '  Child Start y: ' + v.posYStart + ' (Child margin[' + v.options.margin_top + '] + Parent[' + this.posYStart + '])');
        }


        if (v instanceof jPeaDFBlock) {
            //this.pdf_obj.ypos = this.block_ypos;
            //this.pdf_obj.doc.goToPage(this.block_ypage);
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
