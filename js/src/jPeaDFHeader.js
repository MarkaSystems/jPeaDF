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

    if (this.debug && this.debug.creation) {
        window.console.log('***********************Creating jPeaDFHeader-----------');
        window.console.log('Options:');
        window.console.log(this.options);
        window.console.log('Id: ' + this.options.id);
        window.console.log('Width: ' + this.options.widthInitial);
        window.console.log('Height: ' + this.options.heightInitial);
        window.console.log('Margin lrtb: ' + this.options.margin_left + ' ' + this.options.margin_right + ' ' + this.options.margin_top + ' ' + this.options.margin_bottom);
        window.console.log('Padding lrtb: ' + this.options.padding_left + ' ' + this.options.padding_right + ' ' + this.options.padding_top + ' ' + this.options.padding_bottom);
        window.console.log('--------------------------\n\n');
    }
}

jPeaDFHeader.prototype.setParent = function(p) {
    this.parent = p;
}

jPeaDFHeader.prototype.setPdfObj = function(obj) {
    this.pdf_obj = obj;
}

// recursive
jPeaDFHeader.prototype.drawItems = function() {
    this.pdf_obj.doc.setFontSize(this.options.font_size);
    this.pdf_obj.setColor(this.options.font_color, [0, 0, 0]);
    
    this.pdf_obj.ypos = this.pdf_obj.ypos + this.options.margin_top;
    // the new height after text flow
    var splits = this.pdf_obj.doc.splitTextToSize(this.header_text.toString(), this.options.width - this.options.padding_left - this.options.padding_right, {});
    var overflow = this.options ? (this.options.overflow) : this.options.overflow;
    this.header_text = overflow ? splits : [splits[0]];// if there is an overflow
    var temp_height = (this.options.line_spacing * this.header_text.length) + this.options.padding_top + this.options.padding_bottom;
    this.options.height = Math.max(temp_height, this.options.height);

    // if block will flow to next page!
    window.console.log('Height initial ' + this.options.heightInitial);
    if (this.pdf_obj.ypos + this.options.height > this.pdf_obj.options.height - this.pdf_obj.options.padding_bottom) {
        this.pdf_obj.goToNextPage();
        this.pdf_obj.ypos = this.pdf_obj.options.padding_top;
    }

    window.console.log('#' + this.options.id + ' Drawing block at ' + this.posXStart + '  [ ' + this.options.width + ' , ' + this.options.height + ']');
    if (this.options.fill_color) {
        this.pdf_obj.setFill(null, this.options.fill_color);
        this.pdf_obj.doc.rect(this.posXStart, this.pdf_obj.ypos, this.options.width, this.options.height, 'F');
    }
    if (this.options.border_color) {
        this.pdf_obj.setLineWidth(null, this.options.border_width);
        this.pdf_obj.setLineColor(null, this.options.border_color);
        this.pdf_obj.doc.rect(this.posXStart, this.pdf_obj.ypos, this.options.width, this.options.height, 'D');
    }

    // now draw the text
    this.pdf_obj.drawSplitText(this.header_text, this.options.font_size, this.options.line_spacing, this.options.width, this.options.height, this.posXStart,0, [this.options.padding_left, this.options.padding_right, this.options.padding_top, this.options.padding_bottom],this.options.halign,this.options.valign, false);

    // revert to standard font!
    this.pdf_obj.doc.setFontSize(this.pdf_obj.options.font_size);
    this.block_ypos = this.pdf_obj.ypos + this.options.height;
    this.pdf_obj.ypos = this.pdf_obj.ypos + this.options.height;
    this.block_ypage = this.pdf_obj.doc.getPage();

}
