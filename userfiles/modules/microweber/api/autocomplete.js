mw.autoComplete = function(options){
    var scope = this;
    this.prepare = function(options){
        options = options || {};
        if(!options.data && !options.ajaxConfig) return;
        var defaults = {
            size:'normal',
            multiple:false
        }
        this.options = $.extend({}, defaults, options);
        this.options.element = $(this.options.element)[0];
        if(!this.options.element){
            return;
        }
        this.element = this.options.element;
        this.data = this.options.data;
        this.searchTime = null;
        this.searchTimeout = this.options.data ? 0 : 500;
        this.results = [];
        this.options.map = this.options.map || {title:'title', value:'id'};
        this.map = this.options.map;
        this.selected = this.options.selected || []
    }

    this.createValueHolder = function(){
        this.valueHolder = document.createElement('div');
        this.valueHolder.className = 'mw-autocomplete-value';
        return this.valueHolder;
    }
    this.createListHolder = function(){
        this.listHolder = document.createElement('ul');
        this.listHolder.className = 'mw-ui-box mw-ui-navigation mw-autocomplete-list';
        return this.listHolder;
    }

    this.createWrapper = function(){
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'mw-ui-field mw-autocomplete mw-autocomplete-multiple-' + this.options.multiple;
        return this.wrapper;
    }

    this.createField = function(){
        this.inputField = document.createElement('input');
        this.inputField.className = 'mw-ui-invisible-field mw-autocomplete-field mw-ui-field-' + this.options.size;
        $(this.inputField).on('input', function(){
            scope.search(this.value);
        });
        return this.inputField;
    }

    this.buildUI = function(){
        this.createWrapper()
        this.wrapper.appendChild(this.createValueHolder())
        this.wrapper.appendChild(this.createField())
        this.wrapper.appendChild(this.createListHolder())
        this.element.appendChild(this.wrapper)
    }

    this.createListItem = function(data){
        var li = document.createElement('li');
        li.value = this.dataValue(data);
        var img = this.dataImage(data)

        $(li)
        .append( '<a href="javascript:;">'+this.dataTitle(data)+'</a>' )
        .on('click', function(){
            scope.select(data);
        });
        if(img){
            $('a',li).prepend(img)
        }
        return li;
    }

    this.select = function(item){
        if(this.options.multiple){
            this.selected.push(item)
        }
        else{
            this.selected = [item];
        }
        this.rendSelected()
        $(this).trigger('change', [this.selected]);
    }

    this.rendSingle = function(){
        var item = this.selected[0];
        this.inputField.value = this.dataTitle(item);
        this.valueHolder.innerHTML = '';
        this.valueHolder.appendChild(this.dataImage(item));
    }

    this.rendSelected = function(){
        if(this.options.multiple){
            this.chips.setData(this.selected)
        }
        else{
            this.rendSingle()
        }
    }

    this.rendResults = function(){
        $(this.listHolder).empty();
        $.each(this.results, function(){
            scope.listHolder.appendChild(scope.createListItem(this));
        })
    }

    this.dataValue = function(data){
        if(typeof data === 'string'){
            return data;
        }
        else{
            return data[this.map.value]
        }
    }
    this.dataImage = function(data){
        if(data.image){
            var img = document.createElement('span');
            img.className = 'mw-autocomplete-img';
            img.style.backgroundImage = 'url(' + data.image + ')';
            return img;
        }
    }
    this.dataTitle = function(data){
        if(typeof data === 'string'){
            return data;
        }
        else{
            return data[this.map.title]
        }
    }

    this.searchRemote = function(val){
        var config = mw.tools.cloneObject(this.options.ajaxConfig);

        if(config.data){
            if(typeof config.data === 'string'){
                config.data = config.data.replace('${val}',val)
            }
            else{
               $.each(config.data, function(key,val){
                    if(val.indexOf('${val}')!==-1){
                        config.data[key] = val.replace('${val}',val)
                    }
               })
            }
        }
        if(config.url){
            config.url.replace('${val}',val)
        }
        var xhr = $.ajax(config);
        xhr.done(function(data){
            if(data.data){
                scope.data = data.data;
            }
            else{
               scope.data = data;
            }
            scope.results = scope.data

        })
        .always(function(){
            scope.searching = false;
        })
    }

    this.searchLocal = function(val){

        this.results = [];
        var toSearch;
        $.each(this.data, function(){
           if(typeof this === 'string'){
                toSearch = this.toLowerCase()
           }
           else{
               toSearch = this[scope.map.title].toLowerCase()
           }
           if(toSearch.indexOf(val) !== -1){
            scope.results.push(this)
           }
        });
       this.rendResults();
       scope.searching = false;
    }

    this.search = function(val){
        if(scope.searching) return;
        val = val || '';
        val = val.trim().toLowerCase();

        if(this.options.data){
            this.searchLocal(val)
        }
        else{
            clearTimeout(this.searchTime);
            setTimeout(function(){
                scope.searching = true;
                scope.searchRemote(val);
            }, this.searchTimeout)
        }
    }

    this.init = function(){
        this.prepare(options);
        this.buildUI();
        if(this.options.multiple){
            this.chips = new mw.chips({
                element:this.valueHolder,
                data:[]
            })
        }
        this.rendSelected();
    }




    this.init();

}