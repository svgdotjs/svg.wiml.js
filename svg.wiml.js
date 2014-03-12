// svg.wiml.js 0.1.1 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
;(function() {

  SVG.WIML = SVG.invent({
    // Initialize class
    create: function(element) {
      /* store target element */
      this.target = element

      /* initialize store objects */
      this.content = ''
      this.data = {
        variables: {}
      , defaults:  {}
      }
    }

    // Add custom methods to invented shape
  , extend: {
      // Set or get dynamic text content 
      text: function(text) {
        if (text == null)
          return this.content  
        
        /* store given content */
        this.content = text

        return this
      }
      // Get a list of interpolatable fields
    , fields: function() {
        var m, i
          , fields = []
          , found  = this.content.match(SVG.regex.wiml.all)

        /* parse dynamic fields */
        if (found)
          for (i = 0; i < found.length; i++)
            if (m = found[i].match(SVG.regex.wiml.single))
              fields.push(m[2])

        return fields
      }
      // Set or get interpolation variables, disable fallback if required
    , variables: function(variables, fallback) {
        /* getter */
        if (variables == null)
          return this.data.variables

        /* specific getter */
        if (typeof variables === 'string')
          return this.data.variables[variables] || (fallback === false ? this.data.variables[variables] : this.data.defaults[variables])

        /* getter, only if object is given */
        if (typeof variables === 'object') {
          for (var i in variables)
            this.data.variables[i] = variables[i]
        }

        return this
      }
      // Set default interpolation varibales to fall back on
    , defaults: function(defaults) {
        /* getter */
        if (arguments.length == 0)
          return this.data.defaults

        /* specific getter */
        if (typeof defaults === 'string')
          return this.data.defaults[defaults]

        /* getter, only if object is given */
        if (typeof defaults === 'object')
          this.data.defaults = defaults

        return this
      }
      // Provide an iterator to be able to manipulate tspans during rendering
    , iterate: function(block) {
        if (typeof block === 'function')
          this.iterator = block

        return this
      }
      // Render content with optional interpolatable data
    , render: function(variables, fallback) {
        /* store given variables */
        if (variables)
          this.variables(variables)

        /* reset errors */
        this.data.errors = []

        /* initialize local variables */
        var i, il, n, m, t, condition, conditions, name, negative, present, value, parts, tspans
          , content     = this.content
          , variables   = Object.keys(this.variables())
          , fields      = this.fields()
          , list        = content.match(SVG.regex.wiml.variables)
          , self        = this

        if (list) {
          /* interpolate dynamic content */
          list.forEach(function(field) {
            m = field.match(SVG.regex.wiml.variable)
            
            content = content.replace(new RegExp(field, 'g'), (self.variables(m[1], fallback) || ' ') + '%')
          })
        }

        /* parse escaped % values */
        content = content.replace(/%%%/g, '<wiml:percent>')

        /* render WIML to svg */
        this.target.text(function(add) {

          /* render lines */
          content.split('\n').forEach(function(line) {
            tspans = []

            /* make line splittable */
            if (m = line.match(SVG.regex.wiml.statics))
              m.forEach(function(val) { line = line.replace(val, '<wiml:tspan>' + val + '<wiml:tspan>') })

            /* split line */
            parts = line.split('<wiml:tspan>')

            /* separate content from attributes */
            for (i = 0, il = parts.length; i < il; i++) {
              if (parts[i] != '') {
                /* create text part */
                t = {
                  attr:   {}
                , wrap:   false
                , render: true
                }

                /* split part and store text */
                if (m = parts[i].match(SVG.regex.wiml.instance)) {
                  /* convert wiml:percent into % signs */
                  t.text = m[3].replace(/<wiml:percent>/g, '%')

                  /* build attribute object */
                  if (m[2]) {
                    /* find given attribute values */
                    m[2].match(SVG.regex.wiml.attributes).forEach(function(a) {
                      if (a && a != '') {
                        a = a.replace(';', '').split(':')
                        t.attr[a[0]] = a[1]
                      }
                    })

                    /* get condition */
                    condition = t.attr.if || t.attr.unless

                    /* split out conditions */
                    if (condition != null) {
                      if (SVG.regex.wiml.matchAny.test(condition)) {
                        /* disable rendering by default */
                        t.render = false

                        /* split multiple conditions */
                        conditions = condition.split(',')

                        /* make sure all conditions are met */
                        for (n = conditions.length - 1; n >= 0; n--) {
                          name     = conditions[n].replace(SVG.regex.wiml.negative, '')
                          negative = SVG.regex.wiml.negative.test(conditions[n])
                          present  = isPresent(variables, name, self.variables(name, fallback))

                          if ((!negative && present) || (negative && !present))
                            t.render = true
                        }

                      } else if(SVG.regex.wiml.matchAll.test(condition)) {
                        /* split multiple conditions */
                        conditions = condition.split('+')

                        /* make sure all conditions are met */
                        for (n = conditions.length - 1; n >= 0; n--) {
                          name     = conditions[n].replace(SVG.regex.wiml.negative, '')
                          negative = SVG.regex.wiml.negative.test(conditions[n])
                          present  = isPresent(variables, name, self.variables(name, fallback))

                          if ((negative && present) || (!negative && !present))
                            t.render = false
                        }

                      } else {
                        value = self.variables(condition, fallback)
                        t.render = isPresent(variables, condition, value)
                      } 

                      /* toggle render if condition is unless */
                      if (condition == t.attr.unless)
                        t.render = !t.render
                    }

                    /* make sure no invalid attributes are left */
                    delete t.attr.if
                    delete t.attr.unless

                    /* only wrap text in tspan if there are any attributes */
                    t.wrap = Object.keys(t.attr).length > 0
                  }
                } else {
                  /* add plain text */
                  t.text = parts[i]
                }
                
                /* add part to list */
                tspans.push(t)
              }
            }

            /* render line */
            add.tspan(function(nest) {
              /* render line content */
              tspans.forEach(function(t, i) {
                
                if (self.iterator)
                  self.iterator.call()

                if (t.render) {
                  /* create plain text or tspan based on presence of attributes */
                  if (t.wrap === true)
                    n = nest.tspan(t.text).attr(t.attr)
                  else if (i > 0 || !SVG.regex.wiml.blank.test(t.text))
                    n = nest.plain(t.text)
                }
              })
              
              /* make sure content is correctly newlined and whitespace-only lines removed */
              if (tspans.length == 0 || (tspans.length == 1 && this.node.firstChild && SVG.regex.wiml.blank.test(this.node.firstChild.nodeValue)))
                this.parent.node.removeChild(this.node)
              else
                this.newLine()
            })
          })

        })

        /* store interpolated string in target element */
        this.target.content = content
        
        return this
      }
      
    }

    // Add method to parent elements
  , construct: {
      // Build wimlified text element
      wiml: function(text, data, block) {
        var t = this.text(' ')
        t.wiml(text, data, block)
        return this.put(t)
      }

    }
  })
  
  // Add method to text instance
  SVG.extend(SVG.Text, {
    // Render WIML content
    wiml: function(text, data, block) {
      return (this.wimler || (this.wimler = new SVG.WIML(this)))
        .iterate(block)
        .text(text)
        .render(data)
    }

  })

  // Precompile WIML regexes
  SVG.regex.wiml = {
    /* get all wiml instances */
    all:        /%(\{[^\}]+\})?=?[^%]+%/g

    /* parse values from a single instance */
  , single:     /%(\{[^}]+\})?=([^%]+)%/

    /* get all wiml variables */
  , variables:  /=[^%]+%/g

    /* get wiml variable key */
  , variable:   /=([^%\s]+)%/

    /* get all static instances */
  , statics:    /%(\{[^\}]+\})?[^%]+%/g

    /* split attributes from content */
  , instance:   /%(\{([^}]+)\})?([^%]+)%/

    /* parse attributes */
  , attributes: /([^:]+:[^;]+);?/g

    /* blank value */
  , blank:      /^(\s+?)?$/

    /* negative operator */
  , negative:   /^!/

  , /* all condition string */
    matchAll:   /^[^\+]+\+[^\+]+/

  , /* any condition string */
    matchAny:   /^[^,]+,[^,]+/
  }

  // Helpers
  function isPresent(variables, name, value) {
    return variables.indexOf(name) > -1 && value != '' && value != null
  }


}).call(this);