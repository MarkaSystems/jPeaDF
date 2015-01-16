var jPeaDFList = function(contents, options) {
    this.debug = {creation: false};
    //this.debug = false;
    this.parent = null;
    this.posXStart = 0;
    this.posYStart = 0;
    this.block_ypos = 0;
    this.block_ypage = 0;
    this.options = {};
    this.list_data = contents;
    // the block options


    this.options.list_type = (options && options.list_type) || 'numeric';
    this.options.halign = (options && options.halign) || 'l';
    this.options.valign = (options && options.valign) || 't';
    // styles
    this.options.font_size = (options && options.font_size) || 12;
    this.options.line_spacing = (options && options.line_spacing) || this.options.font_size * 1.2;
    this.options.list_gap = (options && options.list_gap) || 0;
    this.options.font_style = (options && options.font_style) || null;
    this.options.font_color = (options && options.font_color) || [0, 0, 0];

    this.options.id = (options && options.id) || 'Undefined ID';
    this.options.indentInitial = (options && options.indent) || 10;
    this.options.widthInitial = (options && options.width) || '100%';
    this.options.overflow = (options && options.overflow) || true;
    this.options.heightInitial = (options && options.height) || this.options.font_size * 1.5;
    this.options.padding_left = (options && options.padding_left) || 5;
    this.options.padding_right = (options && options.padding_right) || 5;
    this.options.padding_top = (options && options.padding_top) || 10;
    this.options.padding_bottom = (options && options.padding_bottom) || 10;
    this.options.border_color = (options && options.border_color) || null;
    this.options.border_width = (options && options.border_width) || 0;
    this.options.fill_color = (options && options.fill_color) || null;
    this.options.margin_left = (options && options.margin_left) || 0;
    this.options.margin_right = (options && options.margin_right) || 0;
    this.options.margin_top = (options && options.margin_top) || 0;
    this.options.margin_bottom = (options && options.margin_bottom) || 0;

    if (this.debug && this.debug.creation) {
        window.console.log('***********************Creating jPeaDFList-----------');
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

jPeaDFList.prototype.setParent = function(p) {
    this.parent = p;
}

jPeaDFList.prototype.setPdfObj = function(obj) {
    this.pdf_obj = obj;
}

// recursive
jPeaDFList.prototype.drawItems = function() {

    this.pdf_obj.doc.setFontSize(this.options.font_size);
    this.pdf_obj.setColor(this.options.font_color, [0, 0, 0]);
    this.pdf_obj.ypos = this.pdf_obj.ypos + this.options.margin_top;

    var content_width = this.options.width - this.options.padding_left - this.options.padding_right - this.options.indent;
    // the new height after text flow
    var temp_height = +this.options.padding_top + this.options.padding_bottom;
    for (var i = 0; i < this.list_data.length; i++) {
        var lcontent = this.list_data[i];
        var splits = this.pdf_obj.doc.splitTextToSize(lcontent.content.toString(), content_width, {});
        var overflow = this.options ? (this.options.overflow) : true;
        this.list_data[i].content = overflow ? splits : [splits[0]];// if there is an overflow
        this.list_data[1].height = (this.options.line_spacing * this.list_data[i].content.length) + this.options.list_gap;
        temp_height += (this.options.line_spacing * this.list_data[i].content.length) + this.options.list_gap;
    }
    this.options.height = Math.max(temp_height, this.options.height);

    window.console.log('#' + this.options.id + ' Drawing paragraph at ' + this.posXStart + '  [ ' + this.options.width + ' , ' + this.options.height + ']');
    if (this.options.fill_color) {
        this.pdf_obj.setFill(null, this.options.fill_color);
        this.pdf_obj.doc.rect(this.posXStart, this.pdf_obj.ypos, this.options.width, this.options.height, 'F');
    }
    if (this.options.border_color) {
        this.pdf_obj.setLineWidth(null, this.options.border_width);
        this.pdf_obj.setLineColor(null, this.options.border_color);
        this.pdf_obj.doc.rect(this.posXStart, this.pdf_obj.ypos, this.options.width, this.options.height, 'D');
    }


    var offset_y = this.options.padding_top;
    for (var i = 0; i < this.list_data.length; i++) {
        var lcontent = this.list_data[i];
        window.console.log('Height initial ' + this.options.heightInitial);
        if (this.pdf_obj.ypos + lcontent.height > this.pdf_obj.options.height - this.pdf_obj.options.padding_bottom) {
            this.pdf_obj.goToNextPage();
            this.pdf_obj.ypos = this.pdf_obj.options.padding_top;
            offset_y = 0;
            this.pdf_obj.doc.text(this.posXStart + this.options.padding_left, this.pdf_obj.ypos +  offset_y + (this.options.font_size), '-');
            this.pdf_obj.drawSplitText(lcontent.content, this.options.font_size, this.options.line_spacing, this.options.width, this.options.height, this.posXStart + this.options.padding_left + this.options.indent, offset_y, [this.options.padding_left, this.options.padding_right, this.options.padding_top, this.options.padding_bottom], this.options.halign, this.options.valign, false);

        } else {
            this.pdf_obj.doc.text(this.posXStart + this.options.padding_left, this.pdf_obj.ypos + this.options.padding_top + offset_y + (this.options.font_size), '-');
            this.pdf_obj.drawSplitText(lcontent.content, this.options.font_size, this.options.line_spacing, this.options.width, this.options.height, this.posXStart + this.options.padding_left + this.options.indent, offset_y, [this.options.padding_left, this.options.padding_right, this.options.padding_top, this.options.padding_bottom], this.options.halign, this.options.valign, false);
            offset_y += this.options.list_gap + (lcontent.content.length * this.options.line_spacing);
        }


    }
    // now draw the text

    // revert to standard font!

    this.block_ypos = this.pdf_obj.ypos + this.options.height;
    this.block_ypage = this.pdf_obj.doc.getPage();
    
    if (this.options.floating) {
        window.console.log('Floating block ' + this.options.id);
        this.pdf_obj.ypos = temp_ypos;
        this.pdf_obj.doc.goToPage(temp_page);
    }

}
