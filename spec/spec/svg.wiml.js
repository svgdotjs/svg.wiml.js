describe('WIML', function() {
  var text, wiml
    , noWIML      = 'Just plain text'
    , basicWIML   = 'Text with %=some% other %=value%'
    , complexWIML = 'Much %{fill:#f06;if:more}=more% %{fill:#0f6;stroke:#ccc}complex% wimlified %=text% with %hidden% %=variables%'
    , defaults    = { more: 'More', text: 'Text', variables: 'Variables', some: 'Some', value: 'Value' }
    , variables   = { more: 'Mas', text: 'Tekst', variables: 'Mastaba', some: 'SOME', value: 'vALUE'  }

  afterEach(function() {
    draw.clear()
  })

  describe('SVG.Parent#wiml()', function() {
    beforeEach(function() {
      text = draw.wiml(basicWIML)
    })
    it('returns an instance of SVG.Text', function() {
      expect(text instanceof SVG.Text).toBe(true)
    })
    it('creates a reference ot the wimler in the text element', function() {
      expect(text.wimler instanceof SVG.WIML).toBe(true)
    })
    it('takes an object with variable data as the second argument', function() {
      wiml = text.wiml(complexWIML, variables)
      expect(wiml.variables()).toEqual(variables)
    })
  })

  describe('SVG.Text#wiml()', function() {
    beforeEach(function() {
      text = draw.text(noWIML)
    })
    it('returns an instance of SVG.WIML', function() {
      expect(text.wiml(basicWIML) instanceof SVG.WIML).toBe(true)
    })
    it('takes an object with variable data as the second argument', function() {
      wiml = text.wiml(complexWIML, variables)
      expect(wiml.variables()).toEqual(variables)
    })
  })

  describe('text()', function() {
    beforeEach(function() {
      wiml = draw.text(' ').wiml(basicWIML)
    })
    it('sets the text content of the wiml instance', function() {
      expect(wiml.content).toBe(basicWIML)
    })
    it('returns itself when used as a setter', function() {
      expect(wiml.text(basicWIML)).toBe(wiml)
    })
    it('gets text content of the wiml instance without an argument', function() {
      expect(wiml.text()).toBe(basicWIML)
      expect(wiml.text()).toBe(wiml.content)
    })
  })

  describe('fields()', function() {
    beforeEach(function() {
      wiml = draw.text(' ').wiml(basicWIML)
    })
    it('gets the variable field names parsed from the wiml string', function() {
      expect(wiml.fields()).toEqual(['some', 'value'])
      expect(wiml.text(complexWIML).fields()).toEqual(['more', 'text', 'variables'])
    })
    it('returns an empty array if no variable fields are found', function() {
      expect(wiml.text(noWIML).fields()).toEqual([])
    })
  })

  describe('variables()', function() {
    beforeEach(function() {
      wiml = draw.text(' ').wiml(complexWIML).defaults(defaults).variables(variables)
    })
    it('sets default variable values when an object is given', function() {
      expect(wiml.data.variables.more).toBe('Mas')
      expect(wiml.data.variables.text).toBe('Tekst')
      expect(wiml.data.variables.variables).toBe('Mastaba')
    })
    it('gets a specific variable when a string is given', function() {
      expect(wiml.variables('more')).toBe('Mas')
      expect(wiml.variables('text')).toBe('Tekst')
      expect(wiml.variables('variables')).toBe('Mastaba')
    })
    it('gets the whole variables object without an argument', function() {
      expect(wiml.variables()).toBe(wiml.data.variables)
    })
  })

  describe('defaults()', function() {
    beforeEach(function() {
      wiml = draw.text(' ').wiml(complexWIML).defaults(defaults)
    })
    it('sets default variable values when an object is given', function() {
      expect(wiml.data.defaults.more).toBe('More')
      expect(wiml.data.defaults.text).toBe('Text')
      expect(wiml.data.defaults.variables).toBe('Variables')
    })
    it('gets a specific variable when a string is given', function() {
      expect(wiml.defaults('more')).toBe('More')
      expect(wiml.defaults('text')).toBe('Text')
      expect(wiml.defaults('variables')).toBe('Variables')
    })
    it('gets the whole defaults object without an argument', function() {
      expect(wiml.defaults()).toBe(wiml.data.defaults)
    })
  })

  describe('render()', function() {
    beforeEach(function() {
      text = draw.text(' ')
      wiml = text.wiml(basicWIML, variables)
    })
    it('stores WIML content in content variable on target element', function() {
      expect(text.content).toBe('Text with %SOME% other %vALUE%')
    })
    it('renders the variable data to a string and stores it as content in the target element', function() {
      expect(wiml.content).toBe(basicWIML)
    })
    it('removes useless leading whitespace from lines', function() {
      wiml = text.wiml('      %{fill:#f06}Loads% of whitespace to start with.')
      expect(text.node.firstChild.firstChild.nodeType).toEqual(1)
      expect(text.node.firstChild.firstChild.firstChild.nodeValue).toEqual('Loads')
    })

    describe('creates tspans for WIML instances', function() {
      it('creates tspans', function() {
        wiml = text.wiml('This is %a plain tspan% so it seems. And this is %{fill:#f06}a styles tspan%.')
        expect(text.node.firstChild.childNodes[0].nodeType).toEqual(3)
        expect(text.node.firstChild.childNodes[1].nodeType).toEqual(3)
        expect(text.node.firstChild.childNodes[2].nodeType).toEqual(3)
        expect(text.node.firstChild.childNodes[3].nodeType).toEqual(1)
        expect(text.node.firstChild.childNodes[4].nodeType).toEqual(3)
      })
    })
    
    describe('with attributes', function() {
      it('parses and applies attributes correctly', function() {
        wiml = text.wiml(complexWIML, variables)
        expect(text.node.firstChild.childNodes[3].attributes[0].nodeName).toEqual('id')
        expect(text.node.firstChild.childNodes[3].attributes[1].nodeName).toEqual('fill')
        expect(text.node.firstChild.childNodes[3].attributes[1].nodeValue).toEqual('#00ff66')
        expect(text.node.firstChild.childNodes[3].attributes[2].nodeName).toEqual('stroke')
        expect(text.node.firstChild.childNodes[3].attributes[2].nodeValue).toEqual('#cccccc')
      })
    })

    describe('with nested percent', function() {
      it('escapes the percent value properly', function() {
        wiml = text.wiml('I am %{fill:#f06}about 100%%% sure% it will work.')
        expect(text.node.firstChild.childNodes[0].nodeType).toBe(3)
        expect(text.node.firstChild.childNodes[0].nodeValue).toBe('I am ')
        expect(text.node.firstChild.childNodes[1].nodeType).toBe(1)
        expect(text.node.firstChild.childNodes[1].firstChild.nodeValue).toBe('about 100% sure')
        expect(text.node.firstChild.childNodes[2].nodeType).toBe(3)
        expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' it will work.')
      })
    })

    describe('with conditional "if"', function() {
      describe('single condition', function() {
        it('does render when conditional "if" attributes are met', function() {
          wiml = text.wiml('This is %{if:cheese}not% visible', { cheese: 'kaas' })
          expect(text.node.firstChild.childNodes.length).toBe(3)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
          expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
        })
        it('does not render when conditional "if" attributes are not met with null', function() {
          wiml = text.wiml('This is %{if:cheese}not% visible', {})
          expect(text.node.firstChild.childNodes.length).toBe(2)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
        })
        it('does not render when conditional "if" attributes are not met with blank', function() {
          wiml = text.wiml('This is %{if:cheese}not% visible', { cheese: '' })
          expect(text.node.firstChild.childNodes.length).toBe(2)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
        })
      })
      describe('all multiple', function() {
        it('does render when all multiple conditional "if" attributes are met', function() {
          wiml = text.wiml('This is %{if:cheese+ham}not% visible', { cheese: 'kaas', ham: 'hesp' })
          expect(text.node.firstChild.childNodes.length).toBe(3)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
          expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
        })
        it('does not render when not all multiple conditional "if" attributes are met with blank', function() {
          wiml = text.wiml('This is %{if:cheese+ham}not% visible', { cheese: 'kaas', ham: '' })
          expect(text.node.firstChild.childNodes.length).toBe(2)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
        })
        it('does not render when not all multiple conditional "if" attributes are met with null', function() {
          wiml = text.wiml('This is %{if:cheese+ham}not% visible', { cheese: 'kaas' })
          expect(text.node.firstChild.childNodes.length).toBe(2)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
        })
        describe('negative operator', function() {
          it('does render when all multiple conditional "if" attributes are met', function() {
            wiml = text.wiml('This is %{if:cheese+ham+!mayo}not% visible', { cheese: 'kaas', ham: 'hesp' })
            expect(text.node.firstChild.childNodes.length).toBe(3)
            expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
            expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
            expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
          })
          it('does not render when not all multiple conditional "if" attributes are met', function() {
            wiml = text.wiml('This is %{if:cheese+ham+!mayo}not% visible', { cheese: 'kaas', ham: 'hesp', mayo: 'ketchup' })
            expect(text.node.firstChild.childNodes.length).toBe(2)
            expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
            expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
          })
        })
      })
      describe('any multiple', function() {
        it('does render when some multiple conditional "if" attributes are met', function() {
          wiml = text.wiml('This is %{if:cheese,ham}not% visible', { cheese: 'kaas' })
          expect(text.node.firstChild.childNodes.length).toBe(3)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
          expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
        })
        it('does not render when no multiple conditional "if" attributes are met with blank', function() {
          wiml = text.wiml('This is %{if:cheese,ham}not% visible', { ham: '' })
          expect(text.node.firstChild.childNodes.length).toBe(2)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
        })
        it('does not render when no multiple conditional "if" attributes are met with null', function() {
          wiml = text.wiml('This is %{if:cheese,ham}not% visible')
          expect(text.node.firstChild.childNodes.length).toBe(2)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
        })
        describe('negative operator', function() {
          it('does render when some multiple conditional "if" attributes are met', function() {
            wiml = text.wiml('This is %{if:cheese,!ham}not% visible')
            expect(text.node.firstChild.childNodes.length).toBe(3)
            expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
            expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
            expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
          })
          it('does not render when no multiple conditional "if" attributes are met', function() {
            wiml = text.wiml('This is %{if:cheese,!ham}not% visible', { ham: 'hesp' })
            expect(text.node.firstChild.childNodes.length).toBe(2)
            expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
            expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
          })
        })
      })
    })
    
    describe('with conditional "unless"', function() {
      describe('single condition', function() {
        it('does render when conditional "unless" attributes are met with null', function() {
          wiml = text.wiml('This is %{unless:cheese}not% visible', {})
          expect(text.node.firstChild.childNodes.length).toBe(3)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
          expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
        })
        it('does render when conditional "unless" attributes are met with blank', function() {
          wiml = text.wiml('This is %{unless:cheese}not% visible', { cheese: '' })
          expect(text.node.firstChild.childNodes.length).toBe(3)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
          expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
        })
        it('does not render when conditional "unless" attributes are not met', function() {
          wiml = text.wiml('This is %{unless:cheese}not% visible', { cheese: 'kaas' })
          expect(text.node.firstChild.childNodes.length).toBe(2)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
        })
      })
      describe('all multiple', function() {
        it('does not render when all multiple conditional "unless" attributes are met', function() {
          wiml = text.wiml('This is %{unless:cheese+ham}not% visible', { cheese: 'kaas', ham: 'hesp' })
          expect(text.node.firstChild.childNodes.length).toBe(2)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
        })
        it('does render when not all multiple conditional "unless" attributes are met with blank', function() {
          wiml = text.wiml('This is %{unless:cheese+ham}not% visible', { cheese: '', ham: 'hesp' })
          expect(text.node.firstChild.childNodes.length).toBe(3)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
          expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
        })
        it('does render when not all multiple conditional "unless" attributes are met with null', function() {
          wiml = text.wiml('This is %{unless:cheese+ham}not% visible', { ham: 'hesp' })
          expect(text.node.firstChild.childNodes.length).toBe(3)
          expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
          expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
          expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
        })
        describe('negative operator', function() {
          it('does render when not all multiple conditional "unless" attributes are met', function() {
            wiml = text.wiml('This is %{unless:cheese+ham+!mayo}not% visible', { ham: 'hesp', cheese: 'kaas', mayo: 'ketchup' })
            expect(text.node.firstChild.childNodes.length).toBe(3)
            expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
            expect(text.node.firstChild.childNodes[1].nodeValue).toBe('not')
            expect(text.node.firstChild.childNodes[2].nodeValue).toBe(' visible')
          })
          it('does not render when all multiple conditional "unless" attributes are met with null', function() {
            wiml = text.wiml('This is %{unless:cheese+ham+!mayo}not% visible', { ham: 'hesp', cheese: 'kaas' })
            expect(text.node.firstChild.childNodes.length).toBe(2)
            expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
            expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
          })
          it('does not render when all multiple conditional "unless" attributes are met with blank', function() {
            wiml = text.wiml('This is %{unless:cheese+ham+!mayo}not% visible', { ham: 'hesp', cheese: 'kaas', mayo: '' })
            expect(text.node.firstChild.childNodes.length).toBe(2)
            expect(text.node.firstChild.firstChild.nodeValue).toBe('This is ')
            expect(text.node.firstChild.childNodes[1].nodeValue).toBe(' visible')
          })
        })
      })
    })
    
  })
  
  describe('regex', function() {
    describe('all', function() {
      it('finds all wiml instances in a string', function() {
        var m = complexWIML.match(SVG.regex.wiml.all)
        expect(complexWIML).toMatch(SVG.regex.wiml.all)
        expect(m.length).toBe(5)
      })
      it('does not find anything in a plain string', function() {
        expect(noWIML).not.toMatch(SVG.regex.wiml.all)
      })
    })
    describe('single', function() {
      var s = '%{fill:#f06;if:more}=more%'

      it('finds a complete single wiml instance', function() {
        var m = s.match(SVG.regex.wiml.single)
        expect(s).toMatch(SVG.regex.wiml.single)
        expect(m[1]).toBe('{fill:#f06;if:more}')
        expect(m[2]).toBe('more')
      })
      it('does not find anything in a plain string', function() {
        expect(noWIML).not.toMatch(SVG.regex.wiml.single)
      })
    })
    describe('variables', function() {
      it('finds all wiml variable names in a string', function() {
        var m = complexWIML.match(SVG.regex.wiml.variables)
        expect(complexWIML).toMatch(SVG.regex.wiml.variables)
        expect(m).toEqual(['=more%', '=text%', '=variables%'])
      })
      it('does not find anything in a plain string', function() {
        expect(noWIML).not.toMatch(SVG.regex.wiml.variables)
      })
    })
    describe('variable', function() {
      var s = '%{fill:#f06;if:more}=more%'

      it('finds a single variable name', function() {
        var m = s.match(SVG.regex.wiml.variable)
        expect(s).toMatch(SVG.regex.wiml.variable)
        expect(m[1]).toBe('more')
      })
      it('does not find anything in a plain string', function() {
        expect(noWIML).not.toMatch(SVG.regex.wiml.variable)
      })
    })
    describe('static', function() {
      it('finds all wiml instances static', function() {
        var m = complexWIML.match(SVG.regex.wiml.statics)
        expect(complexWIML).toMatch(SVG.regex.wiml.statics)
        expect(m).toEqual(['%{fill:#f06;if:more}=more%', '%{fill:#0f6;stroke:#ccc}complex%', '%=text%', '%hidden%', '%=variables%'])
      })
      it('does not find anything in a plain string', function() {
        expect(noWIML).not.toMatch(SVG.regex.wiml.statics)
      })
    })
    describe('instance', function() {
      var s = '%{fill:#f06;if:more} Beautiful content in this node %'

      it('splits attributes and content', function() {
        var m = s.match(SVG.regex.wiml.instance)
        expect(s).toMatch(SVG.regex.wiml.instance)
        expect(m[1]).toBe('{fill:#f06;if:more}')
        expect(m[2]).toBe('fill:#f06;if:more')
        expect(m[3]).toBe(' Beautiful content in this node ')
      })
      it('does not find anything in a plain string', function() {
        expect(noWIML).not.toMatch(SVG.regex.wiml.instance)
      })
    })
    describe('attributes', function() {
      var s = ';fill:#f06;if:more'

      it('splits attributes and content', function() {
        var m = s.match(SVG.regex.wiml.attributes)
        expect(s).toMatch(SVG.regex.wiml.attributes)
        expect(m).toEqual([';fill:#f06;', 'if:more'])
      })
      it('does not find anything in a plain string', function() {
        expect(noWIML).not.toMatch(SVG.regex.wiml.attributes)
      })
    })
  })
})





