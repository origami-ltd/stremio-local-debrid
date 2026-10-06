# Stremio Local Debrid — Suomi

Tietokone lataa ja tallentaa Stremio-lisäosiesi torrentit ja suoratoistaa videon televisioon lähiverkon kautta.

## Miksi projekti on olemassa

Hitaan television voi olla vaikea löytää vertaisia, ladata torrentin osia ja toistaa videota samanaikaisesti. Stremio Local Debrid siirtää lataamisen ja tallennuksen tietokoneelle. Televisio saa HTTP-videon kotiverkosta. Hallitset omaa välimuistiasi ilman maksullista pilven debrid-tiliä.

## Toimintaperiaate

Palvelin kysyy lähteitä asennetuilta lisäosilta ja säilyttää niiden asetukset. Torrent-tiivisteet, magnet-linkit ja .torrent-linkit muuttuvat Paikallinen välimuisti -lähteiksi. Lähteen valinta käynnistää latauksen tietokoneella ja lähettää tiedoston televisioon. Kaksoiskappaleet jakavat välimuistin ja seurantapalvelimet. Suoria videolinkkejä ja ulkoisia palveluja ei muunnetta.

## Vaatimukset

Tarvitset Node.js 24:n tai uudemman, vapaata levytilaa sekä tietokoneen ja television, jotka tavoittavat toisensa samassa verkossa. Tilin automaattinen tunnistus toimii macOS:n Stremio 5:ssä. Linux ja Windows käyttävät käsin määritettyä lisäosaluetteloa. Android TV, Google TV ja Fire TV ovat ensisijaiset laitteet; muut asiakkaat voivat vaatia HTTPS:n ja sopivat koodekit.

## Palvelimen asennus

Luo config.json ja määritä käynnistys macOS-, Linux- tai Windows-järjestelmässä komennolla npm run setup. Kirjaudu macOS:n Stremio 5:een TV:n tilillä; syötä Linuxissa/Windowsissa lisäosien URL-osoitteet ohjattuun asennukseen. --yes hyväksyy oletukset, --no-service tallentaa vain asetukset ja --lang valitsee kielen. Nykyiset tunnisteet ja lataukset säilyvät.

```sh
git clone https://github.com/origami-ltd/stremio-local-debrid.git
cd stremio-local-debrid
npm ci
npm run setup
```

```sh
npm run setup -- --no-service
npm start
```

## Television yhdistäminen

Avaa state/status-url.txt-tiedoston osoite, valitse kieli ja Asenna Stremioon tai liitä lisäosan osoite asennuskenttään. Käytä samaa tiliä televisiossa ja päivitä lisäosat tai käynnistä Stremio uudelleen. Valitse elokuvalle tai jaksolle Paikallinen välimuisti. Alkuperäiset lähteet käyttävät edelleen ne avaavaa laitetta. Tilin lisäosat synkronoidaan 60 sekunnin välein.

## Välimuisti ja toisto

Lataukset jatkuvat soittimen sulkemisen jälkeen ja palvelimen uudelleenkäynnistyksen jälkeen. Vain valittu tiedosto ladataan. Oletuksena välimuisti on 100 GiB ja vapaata tilaa varataan 10 GiB; valmistuneet, harvoin käytetyt torrentit poistetaan tarvittaessa. Aloitus riippuu vertaisista ja verkosta. Ei transkoodausta: televisio purkaa videon. Pidä tietokone hereillä ja tavoitettavana. Jos IP muuttuu, päivitä baseUrl ja asenna lisäosa uudelleen.

## Tietosuoja ja lisenssi

Lisäosan URL sisältää yksityisen tunnuksen: älä julkaise sitä ongelmaraporteissa tai kuvakaappauksissa. macOS lukee olemassa olevan profiilin ja lähettää istuntoavaimen vain Stremion viralliselle API:lle tallentamatta kopiota. Määritetyt osoitteet tallennetaan yksityisesti. Mukana ei ole medialuetteloa eikä telemetriaa. Vertaiset voivat nähdä tietokoneen IP:n. Käytä sisältöä, johon sinulla on oikeus. MIT-PoU vaatii automaattisilta järjestelmiltä käytön kirjaamista ja lähdemainintaa.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
