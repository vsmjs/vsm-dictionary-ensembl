const DictionaryEnsembl = require('./DictionaryEnsembl');
const chai = require('chai'); chai.should();
const expect = chai.expect;
const fs = require('fs');
const path = require('path');

describe('DictionaryEnsembl.js', () => {

  const testURLBase = 'http://test';
  const dict =
    new DictionaryEnsembl({ baseURL: testURLBase, log: true, optimap: false });
  const dictOptimized =
    new DictionaryEnsembl({ baseURL: testURLBase, log: true }); // optimap: true

  const melanomaStr = 'melanoma';
  const noResultsStr = 'somethingThatDoesNotExist';

  const getIDPath = path.join(__dirname, '..', 'resources', 'id.json');
  const getMelanomaPath = path.join(__dirname, '..', 'resources', 'melanoma.json');

  const getIDStr = fs.readFileSync(getIDPath, 'utf8');
  const getMatchesForMelanomaStr = fs.readFileSync(getMelanomaPath, 'utf8');

  describe('getDictInfos', () => {
    it('returns empty result when the list of dictIDs does not '
      + ' include the domain\'s dictID', cb => {
      dict.getDictInfos({ filter: { id: [
        ' ',
        'https://www.uniprot.org',
        'https://www.ensemblgenomes.org' ]}},
      (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({ items: [] });
        cb();
      });
    });

    it('returns proper dictInfo object when `options.filter` is not properly ' +
      'defined or the domain\'s dictID is in the list of specified dictIDs', cb => {
      let expectedResult = { items: [
        {
          id: 'https://www.ensembl.org',
          abbrev: 'Ensembl',
          name: 'Ensembl'
        }
      ]};

      dict.getDictInfos({}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal(expectedResult);
      });

      dict.getDictInfos({ filter: { id: [
        'http://www.ensemblgenomes.org',
        'https://www.ebi.ac.uk/complexportal',
        'https://www.ensembl.org' ]}},
      (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal(expectedResult);
      });

      cb();
    });
  });

  describe('getEntries', () => {
    it('returns empty result when the `options.filter.dictID` is properly ' +
      'defined and in the list of dictIDs the domain\'s dictID is not included', cb => {
      dict.getEntries({filter: { dictID: ['']}}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({ items: [] });
      });

      dict.getEntries({filter: { dictID: [
        ' ',
        'https://www.uniprot.org',
        'http://www.ensemblgenomes.org'
      ]}}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({ items: [] });
      });

      cb();
    });
  });

  describe('getEntryMatchesForString', () => {
    it('returns empty result when the `options.filter.dictID` is properly ' +
      'defined and in the list of dictIDs the domain\'s dictID is not included', cb => {
      dict.getEntryMatchesForString(melanomaStr, {filter: { dictID: ['']}},
        (err, res) => {
          expect(err).to.equal(null);
          res.should.deep.equal({ items: [] });
        });

      dict.getEntryMatchesForString(melanomaStr, {filter: { dictID: [
        ' ',
        'https://www.uniprot.org',
        'http://www.ensemblgenomes.org']}},
      (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({ items: [] });
      });

      cb();
    });
  });

  describe('mapEnsemblResToEntryObj', () => {
    it('properly maps EBI Search returned JSON object to a VSM entry '
      + 'object', cb => {
      dict.mapEnsemblResToEntryObj(JSON.parse(getIDStr)).should.deep.equal(
        [
          {
            id: 'https://www.ensembl.org/id/ENSG00000142208',
            dictID: 'https://www.ensembl.org',
            descr: 'AKT serine/threonine kinase 1 [Source:HGNC Symbol;Acc:HGNC:391]',
            terms: [
              {
                str: 'AKT1'
              },
              {
                str: 'ENSG00000142208 (HGNC: AKT1)'
              },
              {
                str: 'RAC'
              },
              {
                str: 'PRKBA'
              },
              {
                str: 'PKB'
              },
              {
                str: 'AKT'
              }
            ],
            z: {
              transcriptCount: 20,
              species: 'Homo sapiens'
            }
          }
        ]
      );

      dictOptimized.mapEnsemblResToEntryObj(JSON.parse(getIDStr))
        .should.deep.equal(
          [
            {
              id: 'https://www.ensembl.org/id/ENSG00000142208',
              dictID: 'https://www.ensembl.org',
              descr: 'Homo sapiens; RAC|PRKBA|PKB|AKT|ENSG00000142208 (HGNC: AKT1); AKT serine/threonine kinase 1 [Source:HGNC Symbol;Acc:HGNC:391]',
              terms: [
                {
                  str: 'AKT1'
                },
                {
                  str: 'ENSG00000142208 (HGNC: AKT1)'
                },
                {
                  str: 'RAC'
                },
                {
                  str: 'PRKBA'
                },
                {
                  str: 'PKB'
                },
                {
                  str: 'AKT'
                }
              ],
              z: {
                transcriptCount: 20,
                species: 'Homo sapiens'
              }
            }
          ]
        );

      cb();
    });
  });

  describe('mapEnsemblResToMatchObj', () => {
    it('properly maps EBI Search returned JSON object to a VSM match '
      + 'object', cb => {
      dict.mapEnsemblResToMatchObj(JSON.parse(getMatchesForMelanomaStr), 'melanoma')
        .should.deep.equal(
          [
            {
              id: 'https://www.ensembl.org/id/ENSOMEG00000002703',
              dictID: 'https://www.ensembl.org',
              str: 'opn4.1',
              descr: 'melanopsin-like [Source:NCBI gene;Acc:112144204]',
              type: 'T',
              terms: [
                {
                  str: 'opn4.1'
                },
                {
                  str: 'ENSOMEG00000002703 (ZFIN_ID: opn4.1)'
                },
                {
                  str: 'opn4'
                },
                {
                  str: 'opn4m2'
                },
                {
                  str: 'opn4l'
                },
                {
                  str: 'opn4c'
                },
                {
                  str: 'melanopsin'
                }
              ],
              z: {
                transcriptCount: 1,
                species: 'Oryzias melastigma'
              }
            }
          ]
        );

      dictOptimized.mapEnsemblResToMatchObj(JSON.parse(getMatchesForMelanomaStr), 'melanoma')
        .should.deep.equal(
          [
            {
              id: 'https://www.ensembl.org/id/ENSOMEG00000002703',
              dictID: 'https://www.ensembl.org',
              str: 'opn4.1',
              descr: 'Oryzias melastigma; opn4|opn4m2|opn4l|opn4c|melanopsin|ENSOMEG00000002703 (ZFIN_ID: opn4.1); melanopsin-like [Source:NCBI gene;Acc:112144204]',
              type: 'T',
              terms: [
                {
                  str: 'opn4.1'
                },
                {
                  str: 'ENSOMEG00000002703 (ZFIN_ID: opn4.1)'
                },
                {
                  str: 'opn4'
                },
                {
                  str: 'opn4m2'
                },
                {
                  str: 'opn4l'
                },
                {
                  str: 'opn4c'
                },
                {
                  str: 'melanopsin'
                }
              ],
              z: {
                transcriptCount: 1,
                species: 'Oryzias melastigma'
              }
            }
          ]
        );

      cb();
    });
  });

  describe('prepareEntrySearchURL', () => {
    it('returns proper URL(s)', cb => {
      const url1 = dict.prepareEntrySearchURL({});
      const url2 = dict.prepareEntrySearchURL({ page: 1, perPage: 2 });
      const url3 = dict.prepareEntrySearchURL({ filter: { id: ['']}, page: 1, perPage: 2 });
      const url4 = dict.prepareEntrySearchURL({ sort: 'id', page: 2, perPage: 500 });
      const url5 = dict.prepareEntrySearchURL({ sort: 'dictID', page: 101, perPage: 101 });
      const url6 = dict.prepareEntrySearchURL({ sort: 'dictID', page: 101, perPage: 100 });
      const url7 = dict.prepareEntrySearchURL({ sort: 'dictID', page: 10001, perPage: 100 });
      const url8 = dict.prepareEntrySearchURL({ filter: { id: ['https://www.ensembl.org/id/ENSG00000141510']},
        page: 3, perPage: 20 });
      const url9 = dict.prepareEntrySearchURL({ filter: {
        id: [ '', 'https://www.ensembl.org/id/ENSMODG00000008869', '  ',
          'https://www.ensembl.org/id/ENSG00000142208', 'https://www.ensembl.org/id/LRG_321' ]
      }, page: -1, perPage: 101 });

      const getAllIDsURLPart = 'domain_source:ensembl_gene';
      const formatURLPart = '&format=json';
      const sortURLPart = '&sort=id';
      const URLfields = 'fields=id%2Cname%2Cdescription%2Cgene_name%2Cgene_synonym%2Ctranscript_count%2Cspecies';
      const expectedURL1 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=50&start=0' + formatURLPart;
      const expectedURL2 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=2&start=0' + formatURLPart;
      const expectedURL3 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=2&start=0' + formatURLPart;
      const expectedURL4 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=50&start=50' + formatURLPart;
      const expectedURL5 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=50&start=5000' + formatURLPart;
      const expectedURL6 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=100&start=10000' + formatURLPart;
      const expectedURL7 = testURLBase + '?query=' + getAllIDsURLPart
        + '&' + URLfields + sortURLPart + '&size=100&start=999999' + formatURLPart;
      const expectedURL8 = testURLBase + '/entry/ENSG00000141510'
        + '?' + URLfields + formatURLPart;
      const expectedURL9 = testURLBase + '/entry/ENSMODG00000008869,ENSG00000142208,LRG_321'
        + '?' + URLfields + formatURLPart;

      url1.should.equal(expectedURL1);
      url2.should.equal(expectedURL2);
      url3.should.equal(expectedURL3);
      url4.should.equal(expectedURL4);
      url5.should.equal(expectedURL5);
      url6.should.equal(expectedURL6);
      url7.should.equal(expectedURL7);
      url8.should.equal(expectedURL8);
      url9.should.equal(expectedURL9);

      cb();
    });
  });

  describe('prepareMatchStringSearchURL', () => {
    it('returns proper URL', cb => {
      const url1 = dict.prepareMatchStringSearchURL(melanomaStr, {});
      const expectedURL = testURLBase + '?query=melanoma&fields=id%2Cname%2Cdescription%2Cgene_name%2Cgene_synonym%2Ctranscript_count%2Cspecies';
      const paginationURLPart1 = '&size=50&start=0';
      const formatURLPart = '&format=json';

      url1.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url2 = dict.prepareMatchStringSearchURL(melanomaStr, { page: 'String' });
      url2.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url3 = dict.prepareMatchStringSearchURL(melanomaStr, { page: 0 });
      url3.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url4 = dict.prepareMatchStringSearchURL(melanomaStr, { page: 4 });
      const paginationURLPart2 = '&size=50&start=150';
      url4.should.equal(expectedURL + paginationURLPart2 + formatURLPart);

      const url5 = dict.prepareMatchStringSearchURL(melanomaStr, { perPage: ['Str'] });
      url5.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url6 = dict.prepareMatchStringSearchURL(melanomaStr, { perPage: 0 });
      url6.should.equal(expectedURL + paginationURLPart1 + formatURLPart);

      const url7 = dict.prepareMatchStringSearchURL(melanomaStr,
        { page: 3, perPage: 100 });
      const paginationURLPart3 = '&size=100&start=200';
      url7.should.equal(expectedURL + paginationURLPart3 + formatURLPart);

      const url8 = dict.prepareMatchStringSearchURL(melanomaStr,
        { page: 1, perPage: 2 });
      const paginationURLPart4 = '&size=2&start=0';
      url8.should.equal(expectedURL + paginationURLPart4 + formatURLPart);

      cb();
    });
  });

  describe('getDescr', () => {
    it('returns proper description string', cb => {
      let species = ['XXX'];
      let terms = [
        { str: 'mainTerm' }, { str: 'Synonym-2'}, { str: 'Synonym-3'}
      ];
      const description = ['A description string'];

      dict.getDescr(species, terms, description).should.equal('A description string');
      dictOptimized.getDescr(species, terms, description).should.equal('XXX; Synonym-3|Synonym-2; A description string');

      species = [];
      dict.getDescr(species, terms, description).should.equal('A description string');
      dictOptimized.getDescr(species, terms, description).should.equal('Synonym-3|Synonym-2; A description string');
      terms = [];
      dict.getDescr(species, terms, description).should.equal('A description string');
      dictOptimized.getDescr(species, terms, description).should.equal('A description string');
      species = ['YYY'];
      dict.getDescr(species, terms, description).should.equal('A description string');
      dictOptimized.getDescr(species, terms, description).should.equal('YYY; A description string');

      cb();
    });
  });

  describe('sortEntries', () => {
    it('sorts VSM entry objects as specified in the documentation', cb => {
      const arr = [
        { id: 'e', dictID: 'rnacentral', terms: [{ str: 'a'}] },
        { id: 'd', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'c', dictID: 'rnacentral', terms: [{ str: 'c'}] },
        { id: 'b', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'a', dictID: 'rnacentral', terms: [{ str: 'c'}] }
      ];
      const arrIdSorted = [
        { id: 'a', dictID: 'rnacentral', terms: [{ str: 'c'}] },
        { id: 'b', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'c', dictID: 'rnacentral', terms: [{ str: 'c'}] },
        { id: 'd', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'e', dictID: 'rnacentral', terms: [{ str: 'a'}] }
      ];
      const arrStrSorted = [
        { id: 'e', dictID: 'rnacentral', terms: [{ str: 'a'}] },
        { id: 'b', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'd', dictID: 'rnacentral', terms: [{ str: 'b'}] },
        { id: 'a', dictID: 'rnacentral', terms: [{ str: 'c'}] },
        { id: 'c', dictID: 'rnacentral', terms: [{ str: 'c'}] }
      ];

      const options = {};
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = {};
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = '';
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = 'dictID';
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = 'id';
      dict.sortEntries(arr, options).should.deep.equal(arrIdSorted);
      options.sort = 'str';
      dict.sortEntries(arr, options).should.deep.equal(arrStrSorted);

      cb();
    });
  });

  describe('trimEntryObjArray', () => {
    it('properly trims given array of VSM entry objects', cb => {
      const arr = [
        { id:'a', dictID: 'A', terms: [{ str: 'aaa'}] },
        { id:'b', dictID: 'B', terms: [{ str: 'bbb'}] },
        { id:'c', dictID: 'C', terms: [{ str: 'ccc'}] }
      ];

      let options = {};
      dict.trimEntryObjArray(arr, options).should.deep.equal(arr);

      options.page = 2;
      dict.trimEntryObjArray([], options).should.deep.equal([]);

      options.page = -1;
      options.perPage = 'no';
      dict.trimEntryObjArray(arr, options).should.deep.equal(arr);

      options.page = 1;
      options.perPage = 2;
      dict.trimEntryObjArray(arr, options).should.deep.equal(arr.slice(0,2));

      options.page = 2;
      dict.trimEntryObjArray(arr, options).should.deep.equal(arr.slice(2,3));

      options.page = 3;
      dict.trimEntryObjArray(arr, options).should.deep.equal([]);

      cb();
    });
  });

  describe('hasProperEntrySortProperty', () => {
    it('returns true or false whether the `options.sort` property for an ' +
      'entry VSM object is properly defined', cb => {
      const options = {};
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = [];
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = {};
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = '';
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = 45;
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);
      options.sort = 'dictID';
      expect(dict.hasProperEntrySortProperty(options)).to.equal(true);
      options.sort = 'id';
      expect(dict.hasProperEntrySortProperty(options)).to.equal(true);
      options.sort = 'str';
      expect(dict.hasProperEntrySortProperty(options)).to.equal(true);
      options.sort = noResultsStr;
      expect(dict.hasProperEntrySortProperty(options)).to.equal(false);

      cb();
    });
  });
});
