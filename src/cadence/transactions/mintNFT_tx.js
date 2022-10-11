export const mintNFT = 
`
import SmolRunners from 0x1a60d5649eeb9d82 
import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

transaction(
  recipient: Address,
  name: String,
  description: String,
  thumbnail: String,
) {
  prepare(signer: AuthAccount) {
    if signer.borrow<&SmolRunners.Collection>(from: SmolRunners.CollectionStoragePath) != nil {
      return
    }

    // Create a new empty collection
    let collection <- SmolRunners.createEmptyCollection()

    // save it to the account
    signer.save(<-collection, to: SmolRunners.CollectionStoragePath)

    // create a public capability for the collection
    signer.link<&{NonFungibleToken.CollectionPublic}>(
      SmolRunners.CollectionPublicPath,
      target: SmolRunners.CollectionStoragePath
    )
  }


  execute {
    // Borrow the recipient's public NFT collection reference
    let receiver = getAccount(recipient)
      .getCapability(SmolRunners.CollectionPublicPath)
      .borrow<&{NonFungibleToken.CollectionPublic}>()
      ?? panic("Could not get receiver reference to the NFT Collection")

    // Mint the NFT and deposit it to the recipient's collection
    SmolRunners.mint(
      recipient: receiver,
      name: name,
      description: description,
      thumbnail: thumbnail,
    )
    
    log("Minted an NFT and stored it into the collection")
  } 
}
`