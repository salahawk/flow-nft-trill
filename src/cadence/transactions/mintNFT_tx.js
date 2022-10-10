export const mintNFT = 
`
import TrillNode from 0x1a60d5649eeb9d82 
import NonFungibleToken from 0x631e88ae7f1d7c20

transaction(
  recipient: Address,
  name: String,
  description: String,
  thumbnail: String,
) {
  prepare(signer: AuthAccount) {
    if signer.borrow<&TrillNode.Collection>(from: TrillNode.CollectionStoragePath) != nil {
      return
    }

    // Create a new empty collection
    let collection <- TrillNode.createEmptyCollection()

    // save it to the account
    signer.save(<-collection, to: TrillNode.CollectionStoragePath)

    // create a public capability for the collection
    signer.link<&{NonFungibleToken.CollectionPublic}>(
      TrillNode.CollectionPublicPath,
      target: TrillNode.CollectionStoragePath
    )
  }


  execute {
    // Borrow the recipient's public NFT collection reference
    let receiver = getAccount(recipient)
      .getCapability(TrillNode.CollectionPublicPath)
      .borrow<&{NonFungibleToken.CollectionPublic}>()
      ?? panic("Could not get receiver reference to the NFT Collection")

    // Mint the NFT and deposit it to the recipient's collection
    TrillNode.mint(
      recipient: receiver,
      name: name,
      description: description,
      thumbnail: thumbnail,
    )
    
    log("Minted an NFT and stored it into the collection")
  } 
}
`