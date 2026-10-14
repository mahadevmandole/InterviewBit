function Brand({ inverse = false }) {
  return <a className={`brand ${inverse ? 'brand-inverse' : ''}`} href="#home" aria-label="RoundZero home"><span className="brand-icon" aria-hidden="true"><span /><span /><span /><span /></span><span>Round<span className="brand-accent">Zero</span></span></a>
}
export default Brand
