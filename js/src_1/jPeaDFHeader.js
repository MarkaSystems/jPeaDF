var jPeaDFHeader = function(header_text, options) {
    this.debug = {creation: false};
    //this.debug = false;
    this.parent = null;
    this.posXStart = 0;
    this.posYStart = 0;
    this.block_ypos = 0;
    this.block_ypage = 0;
    this.options = {};
    this.header_text = header_text;

    this.start_y_pos = 0;
    this.start_y_page = 0;
    this.end_y_pos = 0;
    this.end_y_page = 0;
    this.total_height = 0;

    // the block options
    this.options.header_type = (options && options.type) || 'h1';
    this.options.halign = (options && options.halign) || 'c';
    this.options.valign = (options && options.valign) || 'm';
    // styles

    if (options && options.font_size) {
        this.options.font_size = options.font_size;
    } else {
        switch (this.options.header_type) {
            case 'h1':
                this.options.font_size = 18;
                break;
            case 'h2':
                this.options.font_size = 16;
                break;
            case 'h3':
                this.options.font_size = 14;
                break;
            case 'h4':
                this.options.font_size = 12;
                break;
            default:
                this.options.font_size = 18;
        }
    }

    this.options.line_spacing = (options && options.line_spacing) || this.options.font_size * 1.2;

    this.options.font_style = (options && options.font_style) || null;
    this.options.font_color = (options && options.font_color) || [0, 0, 0];

    this.options.id = (options && options.id) || 'Undefined ID';
    this.options.widthInitial = (options && options.width) || '100%';
    this.options.overflow = (options && options.overflow) || true;
    this.options.heightInitial = (options && options.height) || this.options.font_size * 1.5;
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
}

jPeaDFHeader.prototype.setParent = function(p) {
    this.parent = p;
}

jPeaDFHeader.prototype.setPdfObj = function(obj) {
    this.pdf_obj = obj;
}

jPeaDFHeader.prototype.calculateSize = function() {
    var obj = this.pdf_obj;
    obj.ypos = obj.ypos + this.options.margin_top;
    if (obj.ypos> obj.options.height - obj.options.padding_bottom) {
        obj.goToNextPage();
        obj.ypos = obj.options.padding_top;
    }
    
    obj.doc.setFontSize(this.options.font_size);
    
    this.start_y_page = obj.doc.getPage();
    this.start_y_pos = obj.ypos;
    this.end_y_page = obj.doc.getPage();
    this.end_y_pos = obj.ypos;



    // the new height after text flow
    var splits = obj.doc.splitTextToSize(this.header_text.toString(), this.options.width - this.options.padding_left - this.options.padding_right, {});
    var overflow = this.options ? (this.options.overflow) : this.options.overflow;
    this.header_text = overflow ? splits : [splits[0]];// if there is an overflow
    var temp_height = (this.options.line_spacing * this.header_text.length) + this.options.padding_top + this.options.padding_bottom;
    

    this.options.height = Math.max(temp_height, this.options.height);

    if (obj.ypos + this.options.height > obj.options.height - obj.options.padding_bottom) {
        obj.goToNextPage();
        obj.ypos = obj.options.padding_top;
        this.start_y_page = obj.doc.getPage();
        this.start_y_pos = obj.ypos;
    }
    obj.ypos += this.options.height;
    
    // Back to original
    obj.doc.setFontSize(obj.options.font_size);
    this.end_y_pos = obj.ypos;
    this.end_y_page = obj.doc.getPage();
    // revert to original position for the drawing phase!
//    obj.ypos=this.start_y_pos;
//    obj.doc.goToPage(this.start_y_page);
}

// recursive
jPeaDFHeader.prototype.drawItems = function() {
    var obj = this.pdf_obj;
    obj.doc.setFontSize(this.options.font_size);
    obj.setColor(this.options.font_color, [0, 0, 0]);
    obj.ypos = obj.ypos + this.options.margin_top;
    if (obj.ypos> obj.options.height - obj.options.padding_bottom) {
        obj.goToNextPage();
        obj.ypos = obj.options.padding_top;
    }
    
    
    // if block will flow to next page!
    if (obj.ypos + this.options.height > obj.options.height - obj.options.padding_bottom) {
        obj.goToNextPage();
        obj.ypos = obj.options.padding_top;
    }

    if (this.options.fill_color) {
        obj.setFill(null, this.options.fill_color);
        obj.doc.rect(this.posXStart, obj.ypos, this.options.width, this.options.height, 'F');
    }
    if (this.options.border_color) {
        obj.setLineWidth(null, this.options.border_width);
        obj.setLineColor(null, this.options.border_color);
        obj.doc.rect(this.posXStart, obj.ypos, this.options.width, this.options.height, 'D');
    }

    // now draw the text
    obj.drawSplitText(this.header_text, this.options.font_size, this.options.line_spacing, this.options.width, this.options.height, this.posXStart, 0, [this.options.padding_left, this.options.padding_right, this.options.padding_top, this.options.padding_bottom], this.options.halign, this.options.valign, false);

    // revert to standard font!
    obj.doc.setFontSize(obj.options.font_size);
    this.block_ypos = obj.ypos + this.options.height;
    obj.ypos = obj.ypos + this.options.height;
    this.block_ypage = obj.doc.getPage();

}
