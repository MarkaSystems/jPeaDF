var jPeaDFList = function(contents, options) {
    this.debug = {creation: false};
    //this.debug = false;
    this.parent = null;
    this.posXStart = 0;
    this.posYStart = 0;
    this.block_ypos = 0;
    this.block_ypage = 0;

    this.start_y_pos = 0;
    this.start_y_page = 0;
    this.end_y_pos = 0;
    this.end_y_page = 0;
    this.total_height = 0;

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

}

jPeaDFList.prototype.setParent = function(p) {
    this.parent = p;
}

jPeaDFList.prototype.setPdfObj = function(obj) {
    this.pdf_obj = obj;
}

jPeaDFList.prototype.calculateSize = function() {
    
    var obj = this.pdf_obj;
    obj.ypos = obj.ypos + this.options.margin_top;
    if (obj.ypos> obj.options.height - obj.options.padding_bottom) {
        obj.goToNextPage();
        obj.ypos = obj.options.padding_top;
    }
    
    this.start_y_pos = obj.ypos;
    this.start_y_page = obj.doc.getPage();

    
    var content_width = this.options.width - this.options.padding_left - this.options.padding_right - this.options.indent;

    obj.doc.setFontSize(this.options.font_size);


    // the new height after text flow
    for (var i = 0; i < this.list_data.length; i++) {
        var lcontent = this.list_data[i];
        var splits = obj.doc.splitTextToSize(lcontent.content.toString(), content_width, {});
        var overflow = this.options ? (this.options.overflow) : true;
        this.list_data[i].content = overflow ? splits : [splits[0]];// if there is an overflow
        this.list_data[i].height = (this.options.line_spacing * this.list_data[i].content.length) + this.options.list_gap;
        if (obj.ypos + lcontent.height > obj.options.height - obj.options.padding_bottom) {
            obj.goToNextPage();
            obj.ypos = obj.options.padding_top;
        }
        if (i == 0) { // only if its the first row
            this.start_y_pos = obj.ypos;
            this.start_y_page = obj.doc.getPage();
        }
        obj.ypos += this.list_data[i].height;
    }
    obj.ypos += this.options.padding_top+ this.options.padding_bottom;
    
    this.end_y_pos = obj.ypos;
    this.end_y_page = obj.doc.getPage();
    // revert to original position for the drawing phase!
    //obj.ypos = this.start_y_pos;
    //obj.doc.goToPage(this.start_y_page);


}

// recursive
jPeaDFList.prototype.drawItems = function() {
    var obj = this.pdf_obj;
    obj.setColor(this.options.font_color, [0, 0, 0]);
    obj.doc.setFontSize(this.options.font_size);
    obj.ypos = obj.ypos + this.options.margin_top;
    if (obj.ypos> obj.options.height - obj.options.padding_bottom) {
        obj.goToNextPage();
        obj.ypos = obj.options.padding_top;
    }
    

    var content_width = this.options.width - this.options.padding_left - this.options.padding_right - this.options.indent;
    // the new height after text flow
    var temp_height = +this.options.padding_top + this.options.padding_bottom + (this.options.font_size);
    for (var i = 0; i < this.list_data.length; i++) {
        var lcontent = this.list_data[i];
        var splits = obj.doc.splitTextToSize(lcontent.content.toString(), content_width, {});
        var overflow = this.options ? (this.options.overflow) : true;
        this.list_data[i].content = overflow ? splits : [splits[0]];// if there is an overflow
        this.list_data[i].height = (this.options.line_spacing * this.list_data[i].content.length) + this.options.list_gap;
        temp_height += (this.options.line_spacing * this.list_data[i].content.length) + this.options.list_gap;
    }
    // now calculate how manhy pages it would take
    var total_left = temp_height;
    var current_hpage = (obj.options.height - obj.options.padding_bottom) - obj.ypos; // calculate remainder space
    current_hpage = Math.min(temp_height + (this.options.font_size), current_hpage);
    total_left -= current_hpage;

    if (this.options.fill_color) {
        obj.setFill(null, this.options.fill_color);
        obj.doc.rect(this.posXStart, obj.ypos, this.options.width, current_hpage, 'F');
    }

    if (this.options.border_color) {
        obj.setLineWidth(null, this.options.border_width);
        obj.setLineColor(null, this.options.border_color);
        obj.doc.rect(this.posXStart, obj.ypos, this.options.width, current_hpage, 'D');
    }

    for (var i = 0; i < this.list_data.length; i++) {
        var lcontent = this.list_data[i];
        if (obj.ypos + lcontent.height > obj.options.height - obj.options.padding_bottom) {
            obj.goToNextPage();
            obj.ypos = obj.options.padding_top;

            // draw the new height!
            current_hpage = Math.min(obj.options.height - obj.options.padding_bottom - obj.options.padding_top, total_left + (this.options.font_size));
            total_left -= current_hpage;
            if (this.options.fill_color) {
                obj.setFill(null, this.options.fill_color);
                obj.doc.rect(this.posXStart, obj.ypos, this.options.width, current_hpage, 'F');
            }

            if (this.options.border_color) {
                obj.setLineWidth(null, this.options.border_width);
                obj.setLineColor(null, this.options.border_color);
                obj.doc.rect(this.posXStart, obj.ypos, this.options.width, current_hpage, 'D');
            }

            obj.doc.text(this.posXStart + this.options.padding_left, obj.ypos + this.options.padding_top + (this.options.font_size), '-');
            obj.drawSplitText(
                    lcontent.content,
                    this.options.font_size,
                    this.options.line_spacing,
                    this.options.width,
                    lcontent.height,
                    this.posXStart + this.options.padding_left + this.options.indent,
                    0,
                    [this.options.padding_left, this.options.padding_right, this.options.padding_top, this.options.padding_bottom],
                    this.options.halign,
                    't', false);
            obj.ypos += lcontent.height;
        } else {
            obj.doc.text(this.posXStart + this.options.padding_left, obj.ypos + this.options.padding_top + (this.options.font_size), '-');
            obj.drawSplitText(lcontent.content, this.options.font_size, this.options.line_spacing, this.options.width, lcontent.height, this.posXStart + this.options.padding_left + this.options.indent, 0, [this.options.padding_left, this.options.padding_right, this.options.padding_top, this.options.padding_bottom], this.options.halign, 't', false);

            obj.ypos += lcontent.height;
        }
    }
    // now draw the text

    // revert to standard font!

    this.block_ypos = obj.ypos + this.options.height + (this.options.font_size);
    this.block_ypage = obj.doc.getPage();

    if (this.options.floating) {
        obj.ypos = temp_ypos;
        obj.doc.goToPage(temp_page);
    }

}
