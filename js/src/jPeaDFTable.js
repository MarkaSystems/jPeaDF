var jPeaDFTable = function(h, t, options) {
    this.data = t;
    this.headers = h;
    this.debug = {creation: false};
    //this.debug = false;
    this.parent = null;
    this.pdf_obj = null;
    this.block_ypos = 0;
    this.block_ypage = 0;
    this.posXStart = 0;
    this.posyStart = 0;

    this.options = {};

    this.options.width = 0;
    this.options.id = (options && options.id) || 'Undefinded ID';
    this.options.floating = (options && options.floating) || false;
    this.options.widthInitial = (options && options.width) || '100%';
    this.options.margin_left = (options && options.margin_left) || 0;
    this.options.margin_right = (options && options.margin_right) || 0;
    this.options.margin_top = (options && options.margin_top) || 0;
    this.options.margin_bottom = (options && options.margin_bottom) || 0;
    this.options.font_color = (options && options.font_color) || [0, 0, 0];
    this.options.font_size = (options && options.font_size) || 8;
    this.options.cell_padding = (options && options.cell_padding) || 2;
    this.options.cell_header_fill = (options && options.cell_header_fill) || [0, 0, 0, 100];
    this.options.cell_row_fill = (options && options.cell_row_fill) || [0, 0, 0, 0];
    this.options.cell_line = (options && options.cell_line) || [200, 200, 200];
    this.options.header_height = (options && options.header_height) || this.options.font_size * 1.5;
    this.options.row_height = (options && options.row_height) || this.options.font_size * 1.5;
    this.options.line_width = (options && options.line_width) || [.1];

    if (this.debug && this.debug.creation) {
        window.console.log('Creating jPeaDFTable-----------');
        window.console.log('Options:');
        window.console.log(this.options);
        window.console.log('Id: ' + this.options.id);
        window.console.log('floating: ' + this.options.floating);
        window.console.log('Width: ' + this.options.widthInitial);
        window.console.log('Margin lrtb: ' + this.options.margin_left + ' ' + this.options.margin_right + ' ' + this.options.margin_top + ' ' + this.options.margin_bottom);
        window.console.log('--------------------------\n\n');
    }

}

jPeaDFTable.prototype.setPdfObj = function(obj) {
    this.pdf_obj = obj;
}

jPeaDFTable.prototype.setParent = function(p) {
    this.parent = p;
}


jPeaDFTable.prototype.drawItems = function() {
    window.console.log('#' + this.options.id + ' Drawing table at ' + this.posXStart + '  [ ' + this.options.width + ' , ' + this.options.width + ']');
    // the main settongs for the 
    var obj = this.pdf_obj;
    var tableFontColor = this.options.font_color;
    var tableFontSize = this.options.font_size;
    var tableCellPad = this.options.cell_padding;
    var tableCellHeaderFill = this.options.cell_header_fill;
    var tableCellRowFill = this.options.cell_row_fill;
    var tableCellLine = this.options.cell_line;
    var tableLineWidth = this.options.line_width;
    var tableColWidths = [];
    var tablePosX = 0;
    var posXStart = this.posXStart || 0;
    var tableWidth = this.options.width;
    var tableHeaderHeight = this.options.header_height;
    var tableRowHeight = this.options.row_height;
    var temp_ypos = 0;
    var temp_page = 0;
    
    
    obj.ypos = obj.ypos+this.options.margin_top;
    if (this.options.floating) {
        temp_ypos = obj.ypos;
        temp_page = obj.doc.getPage();
    }
    var temp_xoffset = 0;
    var temp_yoffset = 0;
    //var temp_colwidth = 0;
    // now workout the table width
    tableWidth = this.pdf_obj.getSizeByPercentage(this.options.width, obj.options.width, obj.options.padding_left + obj.options.padding_right);

    //for header
    obj.doc.setFontSize(tableFontSize);
    var scaledFontSize = tableFontSize / obj.doc.internal.scaleFactor;


    // check if page pages!
    if (obj.ypos + tableHeaderHeight > obj.options.height - obj.options.padding_bottom) {
        // new page
        obj.goToNextPage();
        obj.ypos = obj.options.padding_top;
    }

    var temp_total_space = tableWidth;
    var temp_total_count = this.headers.length;
    $.each(this.headers, function(k, v) {// for every cell
        if (v.width) {
            var temp_cell_width = obj.getSizeByPercentage(v.width, tableWidth, 0);
            temp_total_space -= temp_cell_width;
            tableColWidths.push(temp_cell_width);
            temp_total_count--;
        } else {
            tableColWidths.push(20);// default col width
        }

    });
    // now for the remaining
    var temp_remaining = 10;
    try {
        var tsr = temp_total_space / temp_total_count;
        temp_remaining = Math.max(temp_remaining, tsr);
    } catch (e) {
        // do nothing 
    }
    $.each(this.headers, function(k, v) {
        if (!v.width) {
            tableColWidths[k] = temp_remaining;
        }
    });

    if (obj.ypos + tableHeaderHeight > obj.options.height - obj.options.padding_bottom) {
        obj.goToNextPage();
        obj.ypos = obj.options.padding_top;
    }
    $.each(this.headers, function(k, v) {
        if (v.style) {
            obj.setLineWidth(v.style.line_width, tableLineWidth);
            obj.setFill(v.style.fill, tableCellHeaderFill);
            obj.setLineColor(v.style.line_color, tableCellLine);
            obj.setColor(v.style.color, tableFontColor);
            obj.setStyle(v.style.style);
            temp_xoffset = obj.getOffsetX(tableColWidths[k], obj.doc.getStringUnitWidth(v.value.toString()) * scaledFontSize, v.style.halign, 'c', 0, v.style.padding?[v.style.padding,v.style.padding]:[tableCellPad,tableCellPad]);
            temp_yoffset = obj.getOffsetY(tableHeaderHeight, scaledFontSize, v.style.valign, 'm', scaledFontSize, v.style.padding?[v.style.padding,v.style.padding]:[tableCellPad,tableCellPad]);
        } else {
            obj.setLineWidth(null, tableLineWidth);
            obj.setFill(null, tableCellHeaderFill);
            obj.setLineColor(null, tableCellLine);
            obj.setColor(null, tableFontColor);
            obj.setStyle(null);
            temp_xoffset = obj.getOffsetX(tableColWidths[k], obj.doc.getStringUnitWidth(v.value.toString()) * scaledFontSize, null, 'c', 0, [tableCellPad,tableCellPad]);
            temp_yoffset = obj.getOffsetY(tableHeaderHeight, scaledFontSize, null, 'm', scaledFontSize, [tableCellPad,tableCellPad]);
        }
        obj.doc.rect(posXStart + tablePosX, obj.ypos, tableColWidths[k], tableHeaderHeight, 'FD');
        obj.doc.text(posXStart + tablePosX + temp_xoffset, obj.ypos + temp_yoffset, v.value.toString());
        tablePosX += tableColWidths[k];
    });
    obj.ypos += tableHeaderHeight;

    //for rows
    obj.doc.setFontSize(tableFontSize);
    var scaledFontSize = tableFontSize / obj.doc.internal.scaleFactor;

    $.each(this.data, function(krow, vrow) {
        // if it exceeds page bounds= add for each row
        if (obj.ypos + tableRowHeight > obj.options.height - obj.options.padding_bottom) {
            obj.goToNextPage();
            obj.ypos = obj.options.padding_top;
        }
        tablePosX = 0;
        $.each(vrow, function(kcell, vcell) {// for every coloum
            var colw = tableColWidths[kcell];
            // individual settings
            if (vcell.style) {
                obj.setLineWidth(vcell.style.line_width, tableLineWidth);
                obj.setFill(vcell.style.fill, tableCellRowFill);
                obj.setLineColor(vcell.style.line_color, tableCellLine);
                obj.setColor(vcell.style.color, tableFontColor);
                obj.setStyle(vcell.style.style);
                temp_xoffset = obj.getOffsetX(colw, obj.doc.getStringUnitWidth(vcell.value) * scaledFontSize, vcell.style.halign, 'l', 0, vcell.style.padding?[vcell.style.padding,v.style.padding]:[tableCellPad,tableCellPad]);
                temp_yoffset = obj.getOffsetY(tableRowHeight, scaledFontSize, vcell.style.valign, 'm', scaledFontSize, vcell.style.padding?[vcell.style.padding,v.style.padding]:[tableCellPad,tableCellPad]);
            } else {
                obj.setLineWidth(null, tableLineWidth);
                obj.setFill(null, tableCellRowFill);
                obj.setColor(null, tableFontColor);
                obj.setLineColor(null, tableCellLine);
                obj.setStyle(null);
                temp_xoffset = obj.getOffsetX(colw, obj.doc.getStringUnitWidth(vcell.value) * scaledFontSize, null, 'l', 0, [tableCellPad,tableCellPad]);
                temp_yoffset = obj.getOffsetY(tableRowHeight, scaledFontSize, null, 'm', scaledFontSize, [tableCellPad,tableCellPad]);
            }

            obj.doc.rect(posXStart + tablePosX, obj.ypos, colw, tableRowHeight, 'FD');
            obj.doc.text(posXStart + tablePosX + temp_xoffset, obj.ypos + temp_yoffset, vcell.value.toString());
            tablePosX += colw;
        });

        obj.ypos += tableRowHeight;

    });

    this.block_ypos = obj.ypos;
    this.block_ypage = obj.doc.getPage();
    //window.console.log(' after table '+this.block_ypos +'  '+this.block_ypage );
    if (this.options.floating) {
        obj.ypos = temp_ypos;
        obj.doc.goToPage(temp_page);
    }
    // revert to standard font!
    this.pdf_obj.doc.setFontSize(this.pdf_obj.options.font_size);
};