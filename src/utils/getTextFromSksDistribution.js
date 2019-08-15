export default function getTextFromSksDistribution(sksDistribution) {
  return sksDistribution.map(w => w.word).join(" ");
}
