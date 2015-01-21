var PAGE_DIMENSIONS = {
    a4: [595, 842]
};

jPeaDF.prototype.mmToPt = function(n) {
    return n * 2.834645669;
}

jPeaDF.prototype.getDimensionsPts = function(d) {

    return PAGE_DIMENSIONS[d];
}

jPeaDF.prototype.getSizeByPercentage = function(width, parent_w, offset) {
    var r = 0;
    if (width && isNaN(width)) {
        // try parsing percentage
        try {
            return parseInt(width.toString()) / 100 * (parent_w - offset);
        } catch (e) {
            return parent_w - offset;
        }
    } else if (width) {
        return width;
    }
    return r;
}

function jPeaDFGetSizeByPercentage(width, parent_w, offset) {
    var r = 0;
    if (width && isNaN(width)) {
        // try parsing percentage
        try {
            return parseInt(width.toString()) / 100 * (parent_w - offset);
        } catch (e) {
            return parent_w - offset;
        }
    } else if (width) {
        return width;
    }
    return r;
}

function applyChildSize(parent, child) {
    child.options.width = jPeaDFGetSizeByPercentage(child.options.widthInitial, parent.options.width, parent.options.padding_left + parent.options.padding_right);// works out width AFTER the padding
    child.options.padding_left = jPeaDFGetSizeByPercentage(child.options.padding_left, child.options.width, 0);
    child.options.padding_right = jPeaDFGetSizeByPercentage(child.options.padding_right, child.options.width, 0);

    child.options.height = jPeaDFGetSizeByPercentage(child.options.heightInitial, parent.options.height, parent.options.padding_top + parent.options.padding_bottom);// works out width AFTER the padding
    child.options.padding_top = jPeaDFGetSizeByPercentage(child.options.padding_top, child.options.height, 0);
    child.options.padding_bottom = jPeaDFGetSizeByPercentage(child.options.padding_bottom, child.options.height, 0);

    child.options.margin_top = jPeaDFGetSizeByPercentage(child.options.margin_top, parent.options.height, parent.options.padding_top + parent.options.padding_top);// works out width BEFORE the padding
    child.options.margin_left = jPeaDFGetSizeByPercentage(child.options.margin_left, parent.options.width, parent.options.padding_left + parent.options.padding_right);// works out width BEFORE the padding
    child.posXStart = parent.posXStart + child.options.margin_left;
    child.posYStart = parent.posYStart + child.options.margin_top;
}

function createStandardOptions(parent, options){
    parent.posXStart = 0;
    parent.posYStart = 0;
    parent.block_ypos = 0;
    parent.block_ypage = 0;
    parent.start_y_pos = 0;
    parent.start_x_pos = 0;
    parent.start_y_page = 0;
    parent.end_y_pos = 0;
    parent.end_y_page = 0;
    parent.total_height = 0;
    parent.options.floating = (options && options.floating) || false;
    parent.options.font_size = (options && options.font_size) || 12;
    parent.options.line_spacing = (options && options.line_spacing) || parent.options.font_size * 1.2;
    parent.options.font_style = (options && options.font_style) || null;
    parent.options.font_color = (options && options.font_color) || [0, 0, 0];
    parent.options.id = (options && options.id) || 'Undefined ID';
    parent.options.widthInitial = (options && options.width) || '100%';
    parent.options.overflow = (options && options.overflow) || true;
    parent.options.heightInitial = (options && options.height) || parent.options.font_size * 1.5;
    parent.options.padding_left = (options && options.padding_left) || 0;
    parent.options.padding_right = (options && options.padding_right) || 0;
    parent.options.padding_top = (options && options.padding_top) || 0;
    parent.options.padding_bottom = (options && options.padding_bottom) || 0;
    parent.options.border_color = (options && options.border_color) || null;
    parent.options.border_width = (options && options.border_width) || 0;
    parent.options.fill_color = (options && options.fill_color) || null;
    parent.options.margin_left = (options && options.margin_left) || 0;
    parent.options.margin_right = (options && options.margin_right) || 0;
    parent.options.margin_top = (options && options.margin_top) || 0;
    parent.options.margin_bottom = (options && options.margin_bottom) || 0;
}