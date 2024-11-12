import { Heading, HStack, Image, Switch, useColorMode } from "@chakra-ui/react"
import img from '../../assets/logo.png'

function Navbar() {
    const {colorMode, toggleColorMode} = useColorMode()
  return (
    <>
    <HStack justifyContent={'space-between'} paddingX={5}>
        <Image src={img} boxSize={{base: '80px', md: '100px', lg:"150px"}}/>
        <Heading fontSize={{base: '2xl', md: '3xl', lg:"4xl"}}>Task Table</Heading>
        <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} ></Switch>
    </HStack>
    </>
  )
}

export default Navbar;