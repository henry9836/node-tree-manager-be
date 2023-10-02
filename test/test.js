const chai = require('chai');
const chaiHttp = require('chai-http');
let app = require('../dist/app.js');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Node Path Test', () => {
    it('Should GET a Node subtree', (done) => {
        const nodePath = '/Generated Root/Generated Node of Root';

        // Introduce a delay of 1000 milliseconds (1 second) before making the request
        setTimeout(() => {
            chai.request(app)
                .get(`/node?path=${encodeURIComponent(nodePath)}`)
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    done();
                });
        }, 500); //Needs a little delay for everything to get ready
    });
});